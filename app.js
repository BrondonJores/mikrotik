(function () {
    "use strict";

    var SITE_NAME = "BIYEM ASSI WIFI ZONE";

    function query(selector, root) {
        return (root || document).querySelector(selector);
    }

    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function replaceChildrenSafe(node, child) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
        if (child) {
            node.appendChild(child);
        }
    }

    function isResolvedHotspotValue(value) {
        return typeof value === "string" && value.length > 0 && value.indexOf("$(") === -1;
    }

    function decodeMikrotikJsToken(value) {
        return String(value || "").replace(/\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})|\\([0-7]{1,3})|\\([\\'"nrtbfv])/g, function (match, unicode, hex, octal, simple) {
            if (unicode) return String.fromCharCode(parseInt(unicode, 16));
            if (hex) return String.fromCharCode(parseInt(hex, 16));
            if (octal) return String.fromCharCode(parseInt(octal, 8));

            var simpleEscapes = {
                "\\": "\\",
                "'": "'",
                "\"": "\"",
                n: "\n",
                r: "\r",
                t: "\t",
                b: "\b",
                f: "\f",
                v: "\v"
            };

            return Object.prototype.hasOwnProperty.call(simpleEscapes, simple) ? simpleEscapes[simple] : match;
        });
    }

    function cleanText(value, fallback, maxLength) {
        var text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
        if (!text) text = fallback || "";
        if (maxLength && text.length > maxLength) {
            return text.slice(0, maxLength - 1).trim() + "...";
        }
        return text;
    }

    function isAllowedAdTheme(theme) {
        return /^(wifi|premium|sponsor|support)$/i.test(String(theme || ""));
    }

    function getTemplateText(templateId) {
        var template = document.getElementById(templateId);
        if (!template) return "";
        var source = template.content ? template.content : template;
        return (source.textContent || "").replace(/\s+/g, " ").trim();
    }

    function initTemplateText() {
        queryAll("[data-template-text]").forEach(function (node) {
            var text = getTemplateText(node.getAttribute("data-template-text"));
            if (isResolvedHotspotValue(text)) {
                node.textContent = text;
            }
        });
    }

    function initTitle() {
        if (!document.body) return;
        var suffix = document.body.getAttribute("data-title-suffix");
        if (!suffix) return;
        document.title = (window.location.hostname || SITE_NAME) + " - " + suffix;
    }

    function setLoginNote(infoLogin, isVoucher, isError) {
        if (!infoLogin) return;

        infoLogin.classList.toggle("is-error", !!isError);
        replaceChildrenSafe(infoLogin);

        if (isError) {
            infoLogin.appendChild(document.createTextNode("Connexion securisee indisponible. Rechargez la page ou contactez l'assistance."));
            return;
        }

        infoLogin.appendChild(document.createTextNode("Entrez votre "));

        var strong = document.createElement("strong");
        strong.textContent = isVoucher ? "code du pass" : "identifiant membre";
        infoLogin.appendChild(strong);

        infoLogin.appendChild(document.createTextNode(isVoucher ? " pour vous connecter." : " et votre mot de passe."));
    }

    function initExpiredRedirect() {
        var error = getTemplateText("hotspot-error");
        if (!isResolvedHotspotValue(error)) return;

        var isUptimeLimit = /^user .+ has reached uptime limit$/i.test(error);
        var isVoucherLimit = /^kode voucher\/user .+ sudah mencapai batas waktu$/i.test(error);

        if (isUptimeLimit || isVoucherLimit) {
            window.location.href = "./expired.html";
        }
    }

    function initLogin() {
        var loginForm = document.forms.login;
        if (!loginForm || !loginForm.classList.contains("login-form")) return;

        var sendinForm = document.forms.sendin;
        var usernameField = loginForm.elements.username;
        var passwordField = loginForm.elements.password;
        var passwordWrapper = document.getElementById("password-wrapper");
        var usernameLabel = document.getElementById("username-label");
        var infoLogin = document.getElementById("infologin");
        var passwordToggle = query("[data-password-toggle]");
        var passwordVisible = false;

        var qrStream = null;
        var qrAnimationId = null;

        function startQrScanner() {
            var video = document.getElementById("qr-video");
            var canvas = document.getElementById("qr-canvas");
            var btnStart = document.getElementById("btn-start-qr");
            var qrError = document.getElementById("qr-error");

            if (!video || !canvas || !btnStart) return;

            if (qrError) {
                qrError.classList.add("is-hidden");
                qrError.textContent = "";
            }

            btnStart.classList.add("is-hidden");

            navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
                .then(function (stream) {
                    qrStream = stream;
                    video.srcObject = stream;
                    video.setAttribute("playsinline", true);
                    video.play();
                    qrAnimationId = requestAnimationFrame(tickQrScan);
                })
                .catch(function (err) {
                    btnStart.classList.remove("is-hidden");
                    if (qrError) {
                        qrError.textContent = "Impossible d'accéder à la caméra : " + (err.message || err);
                        qrError.classList.remove("is-hidden");
                    }
                });
        }

        function stopQrScanner() {
            var video = document.getElementById("qr-video");
            var btnStart = document.getElementById("btn-start-qr");

            if (qrStream) {
                qrStream.getTracks().forEach(function (track) {
                    track.stop();
                });
                qrStream = null;
            }

            if (video) {
                video.srcObject = null;
            }

            if (qrAnimationId) {
                cancelAnimationFrame(qrAnimationId);
                qrAnimationId = null;
            }

            if (btnStart) {
                btnStart.classList.remove("is-hidden");
            }
        }

        function tickQrScan() {
            var video = document.getElementById("qr-video");
            var canvas = document.getElementById("qr-canvas");
            if (!video || !canvas) return;

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                var ctx = canvas.getContext("2d", { willReadFrequently: true });
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var code = window.jsQR ? window.jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                }) : null;

                if (code && code.data) {
                    var scannedValue = code.data.trim();
                    var codeValue = scannedValue;

                    if (/^https?:\/\//i.test(scannedValue)) {
                        try {
                            var url = new URL(scannedValue);
                            codeValue = url.searchParams.get("username") || url.searchParams.get("voucher") || scannedValue;
                        } catch (e) { }
                    }

                    if (codeValue) {
                        stopQrScanner();
                        if (usernameField && loginForm) {
                            usernameField.value = codeValue;
                            syncVoucherPassword();

                            var qrContainer = document.getElementById("qr-scanner-container");
                            if (qrContainer) {
                                var note = qrContainer.querySelector(".rw-login-note");
                                if (note) {
                                    note.innerHTML = "Code détecté : <strong style='color: var(--success);'>" + codeValue + "</strong>. Connexion en cours...";
                                }
                            }

                            setTimeout(function () {
                                loginForm.submit();
                            }, 1000);
                        }
                        return;
                    }
                }
            }
            if (qrStream) {
                qrAnimationId = requestAnimationFrame(tickQrScan);
            }
        }

        function syncVoucherPassword() {
            if (passwordField && passwordField.type === "hidden") {
                passwordField.value = usernameField ? usernameField.value : "";
            }
        }

        function activateMode(mode, shouldFocus) {
            var isVoucher = mode === "voucher";
            var isQr = mode === "qr";
            passwordVisible = false;

            queryAll("[data-login-mode]").forEach(function (button) {
                var active = button.getAttribute("data-login-mode") === mode;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", active ? "true" : "false");
            });

            var qrContainer = document.getElementById("qr-scanner-container");
            var usernameFieldWrapper = usernameField ? usernameField.closest(".rw-field") : null;
            var submitBtn = loginForm ? loginForm.querySelector(".rw-btn-connect") : null;

            if (qrContainer) {
                qrContainer.classList.toggle("is-hidden", !isQr);
            }
            if (usernameFieldWrapper) {
                usernameFieldWrapper.classList.toggle("is-hidden", isQr);
            }
            if (submitBtn) {
                submitBtn.classList.toggle("is-hidden", isQr);
            }
            if (infoLogin) {
                infoLogin.classList.toggle("is-hidden", isQr);
            }

            if (isQr) {
                if (passwordWrapper) passwordWrapper.classList.add("is-hidden");
                if (passwordField) {
                    passwordField.type = "hidden";
                    passwordField.required = false;
                }
                stopQrScanner();
                setTimeout(startQrScanner, 100);
            } else {
                stopQrScanner();

                if (usernameLabel) {
                    usernameLabel.textContent = isVoucher ? "Code du pass" : "Nom d'utilisateur";
                }

                if (usernameField) {
                    usernameField.placeholder = isVoucher ? "Code du pass" : "Votre identifiant";
                    if (shouldFocus) {
                        usernameField.focus();
                    }
                }

                if (passwordWrapper && passwordField) {
                    passwordWrapper.classList.toggle("is-hidden", isVoucher);
                    passwordField.type = isVoucher ? "hidden" : "password";
                    passwordField.required = !isVoucher;

                    if (passwordToggle) {
                        passwordToggle.hidden = isVoucher;
                        passwordToggle.classList.remove("is-visible");
                        passwordToggle.setAttribute("aria-label", "Afficher le mot de passe");
                    }

                    if (isVoucher) {
                        syncVoucherPassword();
                    } else {
                        passwordField.value = "";
                    }
                }

                setLoginNote(infoLogin, isVoucher, false);
            }
        }

        queryAll("[data-login-mode]").forEach(function (button) {
            button.addEventListener("click", function () {
                activateMode(button.getAttribute("data-login-mode"), true);
            });
        });

        window.voucher = function () {
            activateMode("voucher", true);
        };

        window.member = function () {
            activateMode("member", true);
        };

        if (usernameField) {
            usernameField.addEventListener("input", syncVoucherPassword);
        }

        if (passwordToggle && passwordField) {
            passwordToggle.addEventListener("click", function () {
                if (passwordWrapper && passwordWrapper.classList.contains("is-hidden")) return;

                passwordVisible = !passwordVisible;
                passwordField.type = passwordVisible ? "text" : "password";
                passwordToggle.classList.toggle("is-visible", passwordVisible);
                passwordToggle.setAttribute("aria-label", passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe");
                passwordField.focus();
            });
        }

        var btnStartQr = document.getElementById("btn-start-qr");
        if (btnStartQr) {
            btnStartQr.addEventListener("click", startQrScanner);
        }

        loginForm.addEventListener("submit", function (event) {
            syncVoucherPassword();

            var chapIdNode = document.getElementById("chap-id");
            var chapChallengeNode = document.getElementById("chap-challenge");
            var chapIdRaw = chapIdNode ? chapIdNode.value : "";
            var chapChallengeRaw = chapChallengeNode ? chapChallengeNode.value : "";
            var chapEnabled = isResolvedHotspotValue(chapIdRaw) && isResolvedHotspotValue(chapChallengeRaw);

            if (!chapEnabled) return;

            event.preventDefault();

            if (!sendinForm || typeof window.hexMD5 !== "function" || !usernameField || !passwordField) {
                setLoginNote(infoLogin, false, true);
                return;
            }

            sendinForm.elements.username.value = usernameField.value;
            sendinForm.elements.password.value = window.hexMD5(decodeMikrotikJsToken(chapIdRaw) + passwordField.value + decodeMikrotikJsToken(chapChallengeRaw));
            sendinForm.submit();
        });

        activateMode("voucher", false);

        // Auto-connexion via paramètres URL (ex: ?username=CODE ou ?voucher=CODE)
        function getQueryParam(name) {
            var query = window.location.search.substring(1);
            if (!query) return null;
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (decodeURIComponent(pair[0]) === name) {
                    return decodeURIComponent(pair[1]);
                }
            }
            return null;
        }

        var urlUsername = getQueryParam("username") || getQueryParam("voucher");
        if (urlUsername && usernameField && loginForm) {
            usernameField.value = urlUsername.trim();
            syncVoucherPassword();
            setTimeout(function () {
                loginForm.submit();
            }, 600);
        }
    }

    function isAllowedAdImage(src) {
        if (typeof src !== "string") return "";
        var normalized = src.replace(/\\/g, "/").trim();
        if (normalized.indexOf("..") !== -1) return "";
        if (/^assets\/ads\/[a-z0-9][a-z0-9._/-]*\.(webp|png|jpe?g)$/i.test(normalized)) {
            return normalized;
        }
        return "";
    }

    function safeAdHref(href) {
        if (typeof href !== "string") return "";
        var value = href.trim();
        if (/^tel:\+?[0-9\s-]{6,24}$/i.test(value)) return value.replace(/\s+/g, "");
        if (/^\.\/[a-z0-9-]+\.html(?:#[a-z0-9_-]+)?$/i.test(value)) return value;
        return "";
    }

    function isAdVisible(ad) {
        if (!ad || ad.active === false) return false;

        var now = Date.now();
        var startsAt = typeof ad.startsAt === "string" ? Date.parse(ad.startsAt) : NaN;
        var expiresAt = typeof ad.expiresAt === "string" ? Date.parse(ad.expiresAt) : NaN;

        if (!isNaN(startsAt) && startsAt > now) return false;
        if (!isNaN(expiresAt) && expiresAt < now) return false;

        return true;
    }

    function normalizeAd(ad) {
        if (!ad || typeof ad !== "object" || !isAdVisible(ad)) return null;

        return {
            theme: isAllowedAdTheme(ad.theme) ? String(ad.theme).toLowerCase() : "wifi",
            eyebrow: cleanText(ad.eyebrow, "Offre locale", 36),
            title: cleanText(ad.title, "Votre offre ici", 64),
            description: cleanText(ad.description, "Annonce locale sans script tiers ni tracking.", 130),
            price: cleanText(ad.price, "Sponsor local", 34),
            meta: cleanText(ad.meta, "Espace reserve", 44),
            cta: cleanText(ad.cta, "Voir l'offre", 30),
            href: safeAdHref(ad.href),
            image: isAllowedAdImage(ad.image),
            imageAlt: cleanText(ad.imageAlt, "", 90)
        };
    }

    function normalizeAdsConfig(payload) {
        var source = Array.isArray(payload) ? payload : payload && Array.isArray(payload.ads) ? payload.ads : [];
        var ads = [];

        source.forEach(function (ad) {
            var normalized = normalizeAd(ad);
            if (normalized && ads.length < 5) {
                ads.push(normalized);
            }
        });

        return ads;
    }

    function loadAdsConfig() {
        if (!window.fetch) return Promise.resolve([]);

        return window.fetch("./ads.json", {
            cache: "no-store",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json"
            }
        }).then(function (response) {
            if (!response.ok) throw new Error("Ads config unavailable");
            return response.json();
        }).then(normalizeAdsConfig).catch(function () {
            return [];
        });
    }

    function appendSignalVisual(parent) {
        var visual = document.createElement("div");
        visual.className = "signal-visual";
        visual.setAttribute("aria-hidden", "true");

        for (var i = 0; i < 3; i += 1) {
            visual.appendChild(document.createElement("span"));
        }

        parent.appendChild(visual);
    }

    function createPromoSlide(ad, index) {
        var slide = document.createElement("article");
        slide.className = "promo-slide promo-slide-" + ad.theme;
        slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");
        if (index === 0) slide.classList.add("is-active");

        var eyebrow = document.createElement("p");
        eyebrow.className = "eyebrow";
        eyebrow.textContent = ad.eyebrow;
        slide.appendChild(eyebrow);

        var title = document.createElement("h2");
        title.textContent = ad.title;
        slide.appendChild(title);

        var description = document.createElement("p");
        description.textContent = ad.description;
        slide.appendChild(description);

        var offer = document.createElement("div");
        offer.className = "promo-offer";

        var price = document.createElement("span");
        price.textContent = ad.price;
        offer.appendChild(price);

        var meta = document.createElement("small");
        meta.textContent = ad.meta;
        offer.appendChild(meta);
        slide.appendChild(offer);

        if (ad.href) {
            var link = document.createElement("a");
            link.className = "promo-link";
            link.href = ad.href;
            link.textContent = ad.cta;
            slide.appendChild(link);
        }

        if (ad.image) {
            var figure = document.createElement("figure");
            figure.className = "promo-media";

            var img = document.createElement("img");
            img.src = ad.image;
            img.alt = ad.imageAlt;
            img.width = 220;
            img.height = 160;
            img.loading = index === 0 ? "eager" : "lazy";
            img.decoding = "async";
            figure.appendChild(img);
            slide.appendChild(figure);
        } else {
            appendSignalVisual(slide);
        }

        return slide;
    }

    function renderConfiguredAds(slider, ads) {
        if (!ads.length) return;

        var fragment = document.createDocumentFragment();
        ads.forEach(function (ad, index) {
            fragment.appendChild(createPromoSlide(ad, index));
        });

        replaceChildrenSafe(slider, fragment);
    }

    function initSlider() {
        var slider = query("[data-slider]");
        if (!slider) return;

        var dotsContainer = query(".slide-dots");
        var prevButton = query("[data-slide-prev]");
        var nextButton = query("[data-slide-next]");
        var current = 0;
        var timer = null;
        var slides = [];
        var dots = [];

        function refreshSliderItems() {
            slides = queryAll(".promo-slide", slider);
            dots = [];
            current = 0;

            if (!slides.length) return;
            slides.forEach(function (slide, index) {
                slide.classList.toggle("is-active", index === 0);
                slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");
            });

            if (!dotsContainer) return;

            var dotsFragment = document.createDocumentFragment();
            slides.forEach(function (_, index) {
                var dot = document.createElement("span");
                if (index === 0) dot.className = "is-active";
                dotsFragment.appendChild(dot);
            });
            replaceChildrenSafe(dotsContainer, dotsFragment);
            dots = queryAll("span", dotsContainer);
        }

        function showSlide(index) {
            if (!slides.length) return;
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                var isActive = slideIndex === current;
                slide.classList.toggle("is-active", isActive);
                slide.setAttribute("aria-hidden", isActive ? "false" : "true");
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function nextSlide() {
            showSlide(current + 1);
        }

        function stopSlider() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        function startSlider() {
            stopSlider();
            if (slides.length < 2) return;
            timer = window.setInterval(nextSlide, 5200);
        }

        if (prevButton) {
            prevButton.addEventListener("click", function () {
                showSlide(current - 1);
                startSlider();
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                nextSlide();
                startSlider();
            });
        }

        slider.addEventListener("mouseenter", stopSlider);
        slider.addEventListener("mouseleave", startSlider);
        slider.addEventListener("focusin", stopSlider);
        slider.addEventListener("focusout", startSlider);

        refreshSliderItems();
        showSlide(0);
        startSlider();

        loadAdsConfig().then(function (ads) {
            if (!ads.length) return;
            renderConfiguredAds(slider, ads);
            refreshSliderItems();
            showSlide(0);
            startSlider();
        });
    }

    function initTimedRedirects() {
        queryAll("[data-redirect-after]").forEach(function (node) {
            var delay = parseInt(node.getAttribute("data-redirect-after"), 10);
            var target = node.getAttribute("data-redirect-url") || "";
            if (!delay || delay < 250 || !target) return;

            window.setTimeout(function () {
                window.location.href = target;
            }, delay);
        });
    }

    function scrollToSectionHash() {
        var hash = window.location.hash || "";
        if (!/^#(?:hero|plans|why)$/.test(hash)) return;

        var target = document.getElementById(hash.slice(1));
        if (target && target.scrollIntoView) {
            target.scrollIntoView({ block: "start", inline: "nearest" });
        }
    }

    function initSectionAnchors() {
        window.setTimeout(scrollToSectionHash, 80);
        window.addEventListener("hashchange", scrollToSectionHash);
    }

    function decodeEscapedUrl(value) {
        if (!isResolvedHotspotValue(value)) return "";
        try {
            return window.unescape ? window.unescape(value) : decodeURIComponent(value);
        } catch (error) {
            return value;
        }
    }

    function initStatusPage() {
        if (!document.body || document.body.getAttribute("data-page") !== "status") return;

        if (document.body.getAttribute("data-advert-pending") === "yes") {
            var advertUrl = document.body.getAttribute("data-link-advert") || "";
            if (isResolvedHotspotValue(advertUrl)) {
                window.open(advertUrl, "hotspot_advert", "");
            }
        }
    }

    function initPopupForms() {
        var logoutForm = query("form[data-popup-logout]");
        if (logoutForm) {
            logoutForm.addEventListener("submit", function (event) {
                if (window.name !== "hotspot_status") return;

                event.preventDefault();
                var logoutUrl = document.body.getAttribute("data-link-logout") || logoutForm.action;
                window.open(logoutUrl, "hotspot_logout", "toolbar=0,location=0,directories=0,status=0,menubars=0,resizable=1,width=320,height=320");
                window.close();
            });
        }

        var loginForm = query("form[data-popup-login]");
        if (loginForm) {
            loginForm.addEventListener("submit", function (event) {
                if (window.name !== "hotspot_logout") return;

                event.preventDefault();
                var loginUrl = document.body.getAttribute("data-link-login") || loginForm.action;
                window.open(loginUrl, "_blank", "");
                window.close();
            });
        }
    }

    function initRadvertPage() {
        if (!document.body || document.body.getAttribute("data-page") !== "radvert") return;

        var redirectUrl = decodeEscapedUrl(document.body.getAttribute("data-link-redirect-esc") || "");
        var originalUrl = decodeEscapedUrl(document.body.getAttribute("data-link-orig-esc") || "");

        if (window.name !== "hotspot_advert") {
            var popup = redirectUrl ? window.open(redirectUrl, "hotspot_advert", "") : null;
            window.setTimeout(function () {
                if (popup && popup.focus) popup.focus();
                if (originalUrl) window.location.href = originalUrl;
            }, 1000);
            return;
        }

        window.setTimeout(function () {
            if (redirectUrl) window.location.href = redirectUrl;
        }, 1000);
    }

    function init() {
        initTitle();
        initTemplateText();
        initExpiredRedirect();
        initLogin();
        initSlider();
        initSectionAnchors();
        initTimedRedirects();
        initStatusPage();
        initPopupForms();
        initRadvertPage();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
