"use strict";

var FORM_VALIDATION = ((options = {}) => {
    let _color = "red";
    let _colorBorder = "red";
    let _colorComment = "red";
    let _timeLoad = 0;
    function setColor(options){
        _color = options.color || 'red';
        _colorBorder = options.colorBorder || 'red';
        _colorComment = options.colorComment || 'red';
        _timeLoad = options.timeLoad || 0;
    }

    var validatorRules = {
        required: function (selector) {
            if (selector.type == "file" && selector.getAttribute("input-file") == "") {
                const form = getParent(selector, "form");
                const gallery = form.querySelector("[data-gallery]");
                const image = gallery.querySelectorAll("li");
                return image.length > 0
                    ? undefined
                    : selector.getAttribute("m-required") ||
                          "Vui lòng nhập trường này";
            } else if (selector.dataset.gallery == "preview_img") {
                const form = getParent(selector, "form");
                const gallery = form.querySelector("div[class^='preview_img']");
                const img = gallery.querySelector("img");
                return img.src.trim !== ""
                    ? undefined
                    : selector.getAttribute("m-required") ||
                          "Vui lòng nhập trường này";
            } else {
                return selector.value.trim()
                    ? undefined
                    : selector.getAttribute("m-required") ||
                          "Vui lòng nhập trường này";
            }
        },
        number: function (selector) {
            var regex = /^[0-9]+$/;
            return regex.test(selector.value)
                ? undefined
                : selector.getAttribute("m-number") ||
                      "Vui lòng nhập đúng định dạng số";
        },
        email: function (selector) {
            var regex =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regex.test(selector.value)
                ? undefined
                : selector.getAttribute("m-email") ||
                      "Vui lòng nhập đúng định dạng email";
        },
        min: function (min) {
            return function (selector) {
                return selector.value.length >= min
                    ? undefined
                    : selector.getAttribute("m-min") ||
                          `Vui lòng nhập ít nhất ${min} kí tự`;
            };
        },
        max: function (max) {
            return function (selector) {
                return selector.value.length <= max
                    ? undefined
                    : selector.getAttribute("m-max") ||
                          `Vui lòng nhập tối đa ${min} kí tự`;
            };
        },
        same: function (nameSelector, formElement) {
            return function (selector) {
                var selectorElement = formElement.querySelector(
                    `[name="${nameSelector}"]`
                ).value;
                return selector.value === selectorElement
                    ? undefined
                    : selector.getAttribute("m-same") ||
                          "Mật khẩu không giống nhau";
            };
        },
        different: function (nameSelector, formElement) {
            return function (selector) {
                var selectorElement = formElement.querySelector(
                    `[name="${nameSelector}"]`
                ).value;
                return selector.value !== selectorElement
                    ? undefined
                    : selector.getAttribute("m-different") ||
                          "Mật khẩu không được giống nhau";
            };
        },
        regex: function (regex) {
            return function (selector) {
                return RegExp(regex).test(selector.value)
                    ? undefined
                    : selector.getAttribute("m-regex") ||
                          `Không đúng định dạng quy định`;
            };
        },
    };

    var isChecked = function (selector) {
        return {
            selector: selector,
            check: function (value,element) {
                let message = element.parentElement.getAttribute('m-checked') ?? "Vui lòng nhập trường này";
                return value
                    ? undefined
                    : message;
            },
        };
    };

    var getParent = function (element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    };

    var callFunction = function (func, data, dataForm, selector = "") {
        var arrayFunc = func.split(".");
        if (arrayFunc.length === 1) {
            var func = arrayFunc[0];
            null != window[func] &&
                typeof window[func] === "function" &&
                window[func](data, dataForm, selector);
        } else if (arrayFunc.length === 2) {
            var obj = arrayFunc[0];
            func = arrayFunc[1];
            window[obj] != null &&
                typeof window[obj] === "object" &&
                null != window[obj][func] &&
                typeof window[obj][func] === "function" &&
                window[obj][func](data, dataForm, selector);
        }
    };

    var callFunctionReturn = function (func, data, dataForm, selector = "") {
        var arrayFunc = func.split(".");
        if (arrayFunc.length === 1) {
            var func = arrayFunc[0];
            null != window[func] &&
                typeof window[func] === "function" &&
                window[func](data, dataForm, selector);
            return window[func](data, dataForm, selector);
        } else if (arrayFunc.length === 2) {
            var obj = arrayFunc[0];
            func = arrayFunc[1];
            window[obj] != null &&
                typeof window[obj] === "object" &&
                null != window[obj][func] &&
                typeof window[obj][func] === "function" &&
                window[obj][func](data, dataForm, selector);
            return window[obj][func](data, dataForm, selector);
        }
    };

    options.rules = [
        isChecked('form[data-check] input[type="radio"]'),
        isChecked('form[data-check] input[type="checkbox"]'),
    ];

    var cssAnimation = document.createElement("style");
    cssAnimation.type = "text/css";
    var keyframes = document.createTextNode(
        `@-webkit-keyframes openErrorMessage {from { opacity:0; transform: translateY(15px) } to{opacity:1; transform: translateY(5px)} }`
    );
    cssAnimation.appendChild(keyframes);
    document.getElementsByTagName("head")[0].appendChild(cssAnimation);
    function init(){
        const formElements = document.querySelectorAll(".formValidation");
        Array.from(formElements).forEach((form) => {
            var formRules = {};
            var fileList = [];
            var formElement = null;
            var selectorRules = [];
            var errorSelector = [];
            var editImage = form.dataset.file == "" ? true : false;
            var inputFile;
            var isAbsolute = form.dataset.absolute == "" ? true : false;
            var isClear = form.dataset.clear == "" ? true : false;
            var hasFuncPlus = form.dataset.plus == undefined ? '' : form.dataset.plus;
            let isPass;
            var validateRadioCheckBox = function (rule, isSubmit) {
                var rules = selectorRules[rule.selector];
                var inputElement = formElement.querySelector(rule.selector);
                var errorMessage;
                for (var i in rules) {
                    switch (inputElement.type) {
                        case "radio":
                        case "checkbox":
                            errorMessage = rules[i](
                                formElement.querySelector(
                                    rule.selector + ":checked"
                                ),inputElement
                            );
                            break;
                        default:
                            errorMessage = rules[i](inputElement.value);
                    }
                    if (errorMessage) break;
                }
                if (errorMessage) {
                    actionNoParentElement(errorMessage, inputElement, isSubmit);
                } else {
                    handleClearError({ target: inputElement });
                }
                return !errorMessage;
            };
    
            var insertAfter = function (referenceNode, newNode) {
                referenceNode.parentNode.insertBefore(
                    newNode,
                    referenceNode.nextSibling
                );
            };
    
            var appendError = function (referenceNode, newNode) {
                referenceNode.appendChild(newNode);
            };
    
            var configErrorElement = function (errorElement) {
                errorElement.className = "r-error-message";
                Object.assign(errorElement.style, {
                    color: _color,
                    display: "block",
                    fontSize: "14px",
                    lineHeight: "16px",
                    padding: "4px 0",
                    textAlign: "left",
                    textShadow: "1px 1px #00000030", 
                    animation: "0.3s openErrorMessage ease-in-out forwards",
                });
            };
    
            var actionHasParentElement = function (
                parentElement,
                errorMessage,
                selector,
                isSubmit = true
            ) {
                var errorElement = document.createElement("span");
                configErrorElement(errorElement);
    
                if (errorMessage) {
                    if (isSubmit) {
                        errorSelector.push(selector);
                        switch (selector.type) {
                            case "text":
                            case "password":
                            case "select":
                                errorSelector[0].focus();
                                break;
                            default:
                                break;
                        }
                    }
                    errorElement.innerHTML = errorMessage;
                    switch (selector.type) {
                        case "checkbox":
                        case "radio":
                            if (
                                selector.parentElement.nextSibling.className !==
                                "r-error-message"
                            ) {
                                insertAfter(selector.parentElement, errorElement);
                            }
                            break;
                        default:
                            if (!parentElement.querySelector(".r-error-message")) {
                                appendError(parentElement, errorElement);
                                selector.style.border = "1.68px solid " + _colorBorder;
                            }
                            break;
                    }
                }
            };
    
            var actionNoParentElement = function (
                errorMessage,
                selector,
                isSubmit = true
            ) {
                var errorElement = document.createElement("span");
                configErrorElement(errorElement);
                isAbsolute
                    ? (errorElement.style.position = "absolute")
                    : (errorElement.style.position = "");
                if (errorMessage) {
                    if (isSubmit) {
                        errorSelector.push(selector);
                        switch (selector.type) {
                            case "text":
                            case "password":
                            case "select":
                                errorSelector[0].focus();
                                break;
                            default:
                                break;
                        }
                    }
                    errorElement.innerHTML = errorMessage;
                    switch (selector.type) {
                        case "checkbox":
                        case "radio":
                            if (
                                selector.parentElement.nextSibling.className !==
                                "r-error-message"
                            ) {
                                insertAfter(selector.parentElement, errorElement);
                            }
                            break;
                        default:
                            if (
                                selector.nextSibling.className !== "r-error-message"
                            ) {
                                insertAfter(selector, errorElement);
                                selector.style.border = "1.68px solid " + _colorBorder;
                            }
                            break;
                    }
                }
            };
    
            var handleClearError = function (event) {
                var parentElement = false;
                if (formElement.dataset.parent) {
                    parentElement = getParent(
                        event.target,
                        formElement.dataset.parent
                    );
                }
                switch (event.target.type) {
                    case "checkbox":
                    case "radio":
                        if (
                            event.target.parentElement.nextSibling.className ===
                            "r-error-message"
                        ) {
                            removeStyle(event.target.parentElement.nextSibling);
                        }
                        break;
                    case "select-one":
                        if (event.target.value == "") {
                            handleValidateFocus(event);
                            break;
                        }
                    default:
                        if (
                            event.target.nextSibling.className === "r-error-message"
                        ) {
                            event.target.style.removeProperty("border");
                            removeStyle(event.target.nextSibling);
                        } else if (
                            parentElement &&
                            parentElement.querySelector(".r-error-message")
                        ) {
                            var parentElement = getParent(
                                event.target,
                                formElement.dataset.parent
                            );
                            removeStyle(parentElement.querySelector(".r-error-message"));
                            event.target.style.removeProperty("border");
                        }
                        break;
                }
            };
            var removeStyle = function(element){
                element.animate([{opacity:0,transform: "translateY(10px)"}],{
                    duration:300,
                    fill:"forwards"
                }).onfinish = function(){
                    element.remove();
                };
            }
            var handleValidateFocus = function (event) {
                var selector = event.target;
                var rules = formRules[selector.name];
                var errorMessage;
                for (var rule of rules) {
                    errorMessage = rule(selector);
                    if (errorMessage) {
                        break;
                    }
                }
                var parentElement = false;
                if (formElement.dataset.parent) {
                    parentElement = getParent(selector, formElement.dataset.parent);
                }
                if (parentElement) {
                    actionHasParentElement(
                        parentElement,
                        errorMessage,
                        selector,
                        false
                    );
                } else {
                    actionNoParentElement(errorMessage, selector, false);
                }
                return !errorMessage;
            };
    
            var handleSubmitValidate = function (event) {
                var selector = event.target;
                var rules = formRules[selector.name];
                var errorMessage;
                for (var rule of rules) {
                    errorMessage = rule(selector);
                    if (errorMessage) {
                        break;
                    }
                }
                var parentElement = false;
                if (formElement.dataset.parent) {
                    parentElement = getParent(selector, formElement.dataset.parent);
                }
                if (parentElement) {
                    actionHasParentElement(
                        parentElement,
                        errorMessage,
                        selector,
                        true
                    );
                } else {
                    actionNoParentElement(errorMessage, selector, true);
                }
                return !errorMessage;
            };
    
            var changeImage = function () {
                if (editImage) {
                    let galleryPhotoInput = form.querySelector("[input-file]");
                    let placeGallery = form.querySelector("[data-gallery]");
                    inputFile = galleryPhotoInput.name;
                    galleryPhotoInput.onchange = function (e) {
                        pushFileList(placeGallery,e.target.files);
                        galleryPhotoInput.value = "";
                    };
                }
            };
            
            var pushFileList = function(placeGallery,files){
                Array.from(files).forEach(function(file){
                    if(file.type.indexOf("image") !== -1){
                        fileList.push(file);
                    }
                })
                if(fileList.length > 0){
                    setFileList(placeGallery);
                }
            }

            var buttonImage = function (button, gallery, imgElement, selector) {
                Object.assign(button.style, {
                    position: "absolute",
                    color: "white",
                    background: "#01010150",
                    zIndex: 1,
                    padding: "6px 10px",
                    fontSize: "1vw",
                    fontWeight: "bold",
                    cursor:"pointer",
                    top: "15px",
                    right: "15px",
                    border: "none",
                    borderRadius: "3px",
                });
                button.onmousemove = function () {
                    button.animate(
                        [
                            {
                                backgroundColor: _colorBorder,
                                boxShadow: "0.2px 0.2px 6px 0.2px " + _colorBorder,
                            },
                        ],
                        {
                            duration: 400,
                            fill: "forwards",
                        }
                    );
                };
                button.onmouseleave = function () {
                    button.animate(
                        [
                            {
                                boxShadow: "none",
                                color: "white",
                                background: "#01010150",
                            },
                        ],
                        {
                            duration: 400,
                            fill: "forwards",
                        }
                    );
                };
                button.onclick = function () {
                    const milisecond = 300;
                    imgElement.animate(
                        [
                            { transform: "scale(1)", opacity: 1 },
                            { transform: "scale(0)", opacity: 0 },
                        ],
                        {
                            duration: milisecond,
                            fill: "forwards",
                        }
                    );
    
                    gallery.animate(
                        [
                            { transform: "scale(1)" },
                            { transform: "scale(0)", opacity: 0 },
                        ],
                        {
                            duration: milisecond * 5,
                        }
                    );
                    selector.style.pointerEvents = "all";
                    setTimeout(() => {
                        gallery.remove();
                    }, milisecond);
                };
            };
    
            var elementImage = function (imgElement, img) {
                Object.assign(imgElement.style, {
                    width: "35%",
                    paddingBottom: "20%",
                    borderRadius: "3px",
                    height: "0",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    transition: "box-shadow 0.1s, transform 0.1s",
                    margin: "0 auto",
                    border: "6px solid white",
                    backgroundOrigin: "border-box",
                    transition: "transform 0.1s ease-out,box-shadow 0.2s",
                    backgroundImage: `url(${img}), linear-gradient(0deg,white,white)`,
                });
    
                imgElement.onmousemove = (e) => {
                    const height = imgElement.clientHeight;
                    const width = imgElement.clientWidth;
                    const layerX = e.layerX;
                    const layerY = e.layerY;
                    const yRotation = -8 * ((layerX - width / 2) / width);
                    const xRotation = 8 * ((layerY - height / 2) / height);
                    const string =
                        "perspective(500px) scale(1.1) rotateX(" +
                        xRotation +
                        "deg) rotateY(" +
                        yRotation +
                        "deg)";
                    imgElement.style.transform = string;
                };
    
                imgElement.onmouseleave = function () {
                    imgElement.style.transform = "scale(1)";
                };
    
                imgElement.src = img;
                imgElement.addClass;
                imgElement.onclick = function (e) {
                    e.stopPropagation();
                };
            };
    
            var galleryImage = function (gallery, selector) {
                Object.assign(gallery.style, {
                    position: "fixed",
                    background: "#01010199",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    top: 0,
                    left: 0,
                    zIndex:1060
                });
    
                gallery.animate(
                    [
                        { transform: "scale(0)", opacity: 0 },
                        { transform: "scale(1)", opacity: 1 },
                    ],
                    {
                        duration: 300,
                        iterations: 1,
                    }
                );
    
                gallery.onclick = function () {
                    selector.style.pointerEvents = "all";
                    const milisecond = 300;
                    gallery.animate(
                        [
                            { transform: "scale(1)" },
                            { transform: "scale(0)", opacity: 0 },
                        ],
                        {
                            duration: milisecond,
                            iterations: 1,
                        }
                    );
                    setTimeout(() => {
                        gallery.remove();
                    }, milisecond - 100);
                };
            };
    
            var zoomImg = function (img, selector) {
                var gallery = document.createElement("div");
                var imgElement = document.createElement("div");
                var button = document.createElement("button");
                gallery.className = "img-preview";
                imgElement.className = "img-preview__bg";
                button.innerHTML = "x";
                buttonImage(button, gallery, imgElement, selector);
                elementImage(imgElement, img, gallery);
                galleryImage(gallery, selector);
                gallery.appendChild(imgElement);
                gallery.appendChild(button);
                document.querySelector("body").appendChild(gallery);
            };
    
            var setFileList = function (placeGallery) {
                elementGallery(placeGallery);
                var list = document.createElement("ul");
                elementList(list);
                fileList.forEach((file, i) => {
                    var li = document.createElement("li");
                    var divImage = document.createElement("div");
                    var divAction = document.createElement("div");
                    var img = document.createElement("img");
                    img.src = window.URL.createObjectURL(file);
                    var button = document.createElement("button");
                    button.onclick = function (e) {
                        e.stopPropagation();
                        if (fileList.length == 1) {
                            list.remove('style');
                            placeGallery.removeAttribute('style');
                            fileList = [];
                        }
                        fileList.splice(i, 1);
                        li.remove();
                    };
                    elementDivPreview(divImage);
                    elementDivAction(divAction, button, li, img, file);
                    elementLi(li);
    
                    divImage.appendChild(img);
                    li.appendChild(divImage);
                    li.appendChild(divAction);
                    list.appendChild(li);
                });
                placeGallery.appendChild(list);
            };
    
            var elementList = function (list) {
                var styleElement = document.createElement("style");
                styleElement.appendChild(document.createTextNode("div ::-webkit-scrollbar {display:none;-webkit-appearance: none}"));

                Object.assign(list.style, {
                    display: "grid",
                    listStyle: "none",
                    gridAutoFlow: "column",
                    padding: "16px",
                    overflow:"auto",
                    gridGap: "16px",
                    gridAutoColumns: "120px",
                });
                list.append(styleElement);
                dragList(list);
            };

            function dragList(slider){
                let isDown = false;
                let startX;
                let scrollLeft;
                slider.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isDown = true;
                    slider.style.cursor = "grap";
                    startX = e.pageX - slider.offsetLeft;
                    scrollLeft = slider.scrollLeft;
                });
        
                slider.addEventListener('mouseleave', (e) => {
                    e.preventDefault();
                    isDown = false;
                });
        
                slider.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    isDown = false;
                });
        
                slider.addEventListener('mousemove', (e) => {
                    if(!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - slider.offsetLeft;
                    const walk = (x - startX) * 1; //scroll-fast
                    slider.scrollLeft = scrollLeft - walk;
                });
            }

            var elementGallery = function (gallery) {
                Object.assign(gallery.style, {
                    border: "2px dashed "+ _colorComment,
                    margin: "12px 0",
                    cursor: "pointer",
                    borderRadius: "3px",
                    transition: "all 0.3s ease-in-out"
                });
    
                gallery.ondragover = function () {
                    this.style.borderColor = "blue";
                    this.style.opacity = 0.5;
                    return false;
                };

                gallery.ondragleave = function () {
                    this.style.borderColor = _colorBorder;
                    this.style.opacity = 1;
                    return false;
                };

                gallery.ondragend = function (e) {
                    e.preventDefault();
                    return false;
                };

                gallery.ondrop = function (e) {
                    e.preventDefault();
                    this.style.borderColor = "green";
                    this.style.opacity = 1;
                    pushFileList(gallery,e.dataTransfer.files)
                };

                gallery.onclick = function () {
                    form.querySelector("[input-file]").click();
                };
                gallery.innerHTML = "";
            };
    
            var elementDivPreview = function (divImage) {
                Object.assign(divImage.style, {
                    position: "relative",
                    display: "block",
                    borderRadius: "3px",
                    paddingBottom:"100%",
                    boxShadow:"0 0 3px #00000030"
                });
            };
    
            var elementDivAction = function (divAction, button, li, img, file) {
                elementImg(img);
    
                Object.assign(divAction.style, {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    flexDirection: "column",
                    transition: "all 0.3s",
                });
                var name = file.name;
                var size = Math.ceil(file.size / 1024);
                var pName = document.createElement("p");
                var pSize = document.createElement("p");
    
                pName.innerText = name;
                if (size > 1000) {
                    pSize.innerText = Number(size / 1000).toFixed(1) + " MB";
                } else {
                    pSize.innerText = size + " KB";
                }
                elementName(pName);
                elementSize(pSize);
    
                var progress = document.createElement("div");
                var progressLength = document.createElement("div");
                progress.className = "img-progress";
    
                Object.assign(progress.style, {
                    width: "100px",
                    height: "16px",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "3px",
                    overflow: "hidden",
                });
    
                Object.assign(progressLength.style, {
                    background: "white",
                    height: "100%",
                    width: 0,
                });
    
                progress.appendChild(progressLength);
                divAction.appendChild(progress);
    
                sleep(0)
                    .then(function () {
                        progressLength.animate(
                            [
                                {
                                    width: 0,
                                },
                                {
                                    width: "100%",
                                },
                            ],
                            {
                                duration: size,
                                fill: "forwards",
                            }
                        );
                        return sleep(size);
                    })
                    .then(() => {
                        progressLength.animate(
                            [
                                {
                                    opacity: 0,
                                },
                            ],
                            {
                                duration: 400,
                                fill: "forwards",
                            }
                        );
                        return sleep(600);
                    })
                    .then(() => {
                        progressLength.remove();
                        afterShowImage(li, button, pName, pSize, img);
                        divAction.appendChild(button);
                        divAction.appendChild(pName);
                        divAction.appendChild(pSize);
                    });
            };
    
            var afterShowImage = function (li, button, pName, pSize, img) {
                elementButton(button);
                img.style.filter = "blur(0px)";
                li.style.cursor = "zoom-in";
                li.onmouseover = () => {
                    button.style.opacity = 1;
                    pName.style.opacity = 1;
                    pSize.style.opacity = 1;
                    img.style.filter = "blur(2px)";
                };
                li.onmouseleave = () => {
                    button.style.opacity = 0;
                    pName.style.opacity = 0;
                    pSize.style.opacity = 0;
                    img.style.filter = "blur(0px)";
                };
                li.onclick = (e) => {
                    e.stopPropagation();
                    li.style.pointerEvents = "none";
                    zoomImg(img.src, li);
                };
                pName.onmouseover = function () {
                    Object.assign(pName.style, {
                        background: "white",
                    });
                };
                pName.onmouseleave = function () {
                    Object.assign(pName.style, {
                        background: "#ffffff9e",
                    });
                };
                pSize.onmouseover = function () {
                    Object.assign(pSize.style, {
                        background: "white",
                    });
                };
                pSize.onmouseleave = function () {
                    Object.assign(pSize.style, {
                        background: "#ffffff9e",
                    });
                };
            };
            var sleep = function (ms) {
                return new Promise((resolve) => {
                    setTimeout(resolve, ms);
                });
            };
    
            var elementName = function (name) {
                name.title = name.innerText;
                Object.assign(name.style, {
                    width: "75%",
                    borderRadius: "3px",
                    marginTop:"24px",
                    padding: "4px 10px",
                    background: "#ffffff9e",
                    color: "#0e0e0e",
                    opacity: 0,
                    marginBottom: "8px",
                    fontSize: "12px",
                    display: "block",
                    overflow: "hidden",
                    textAlign:"center",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    transition: "all 0.3s",
                });
            };
    
            var elementSize = function (size) {
                Object.assign(size.style, {
                    width: "75%",
                    borderRadius: "3px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    background: "#ffffff9e",
                    textAlign:"center",
                    color: "#0e0e0e",
                    opacity: 0,
                    display: "-webkit-box",
                    webkitLineClamp: 1,
                    webkitBoxOrient: "vertical",
                    transition: "all 0.3s",
                });
            };
    
            var elementLi = function (li) {
                Object.assign(li.style, {
                    position: "relative",
                    display: "inline-block",
                    verticalAlign: "top",
                });
            };
    
            var elementImg = function (img) {
                Object.assign(img.style, {
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "blur(1px)",
                    transition: "all 0.3s",
                    borderRadius: "3px"
                });
            };
    
            var elementButton = function (button) {
                button.innerHTML = `x`;
                Object.assign(button.style, {
                    position: "absolute",
                    right: "8px",
                    top: "8px",
                    cursor: "pointer",
                    background: _colorComment,
                    border: "1.68px solid "+_colorComment,
                    boxShadow: "0.2px 0.2px 6px 0.2px "+_colorComment,
                    color: "white",
                    height: "20px",
                    width: "20px",
                    fontWeight: "bold",
                    fontSize: "8px",
                    opacity: "0",
                    borderRadius: "3px",
                    transition: "all 0.3s",
                    padding:0
                });
    
                button.onmouseover = function () {
                    Object.assign(button.style, {
                        border: "1.68px solid "+_colorComment,
                        boxShadow: "0.2px 0.2px 6px 0.2px "+_colorComment,
                        transform:"scale(1.05)"
                    });
                };
                button.onmouseleave = function () {
                    Object.assign(button.style, {
                        border: "1.68px solid " + _colorComment,
                        boxShadow: "0.2px 0.2px 6px 0.2px " + _colorComment,
                    });
                };
            };
    
            var clearForm = function (form) {
                const inputs = form.querySelectorAll("[name]");
                inputs.forEach(function (element) {
                    switch (element.type) {
                        case "checkbox":
                        case "radio":
                            element.checked = false;
                            break;
                        case "selected":
                            element.seleced = false;
                            break;
                        case "hidden":
                            break;
                        default:
                            element.value = "";
                            break;
                    }
                });
            };  
    
            var getStyle = function(element, property) {
                return window.getComputedStyle( element , null).getPropertyValue(`'${property}'`);
            };
    
            var submitForm = function (data, formElement) {
                var check = formElement.dataset.success;
                if (!check) {
                    return formElement.submit();
                }
                var method = formElement.getAttribute("method");
                var url = formElement.getAttribute("action");
                var button = formElement.querySelector('button[type="submit"]');
    
                var ajax = new XMLHttpRequest();
                ajax.open(method, url, true);
                ajax.onreadystatechange = function () {
                    button.removeAttribute('style');
                    if(button.hasAttribute('style-old')){
                        button.setAttribute('style',button.getAttribute('style-old'));
                    }
                    button.innerHTML = button.getAttribute("content-old");
                    button.disabled = false;
                    
                    if (ajax.readyState === XMLHttpRequest.DONE) {
                        var status = ajax.status;
                        if (status === 0 || (status >= 200 && status < 400)) {
                            const dataResponse = JSON.parse(ajax.responseText);
                            if (isClear && dataResponse?.code == 200) {
                                const boxGallery = form.querySelectorAll("[data-gallery]");
                                if (boxGallery.length > 0 && boxGallery[0].querySelectorAll("ul").length > 0){
                                    fileList = [];
                                    boxGallery[0].querySelector("ul").innerHTML = '';
                                    boxGallery[0].removeAttribute('style');
                                }
                                clearForm(formElement);
                            }
                            return callFunction(
                                check,
                                dataResponse,
                                data,
                                formElement
                            );
                            
                        } else {
                            alert('Xảy ra lỗi rồi');
                        }
                    }
                };
                var formData = new FormData();
                if (editImage) {
                    Array.from(fileList).forEach(function (file) {
                        formData.append(inputFile + "[]", file);
                    });
                } else if (data.image) {
                    Array.from(data.image).forEach(function (file) {
                        formData.append(inputFile + "[]", file);
                    });
                }
    
                for (const [key, value] of Object.entries(data)) {
                    if (key !== "image") {
                        formData.append(key, value);
                    }
                }
                
                buttonFormBeforeSubmit(button);
    
                ajax.send(formData);
            };

            var buttonFormBeforeSubmit = function(button){
                if(button.getAttribute('style')){
                    button.setAttribute("style-old",button.getAttribute('style'));
                }
                
                const buttonRect = button.getBoundingClientRect();
                Object.assign(button.style, {
                    width: `${buttonRect.width}px`,
                    height: `${buttonRect.height}px`,
                    position: `relative`,
                    display: "inline-block",
                });
    
                if(button.dataset.content){
                    button.setAttribute("content-old",button.dataset.content);
                }else{
                    button.setAttribute("content-old", button.innerHTML);
                }
                button.disabled = true;
                const colorButton = getStyle(button,'color');
                setTimeout(() => {
                    button.innerHTML = `<div class="r-s-loader"></div><style>.r-s-loader{position:absolute;left:50%;top:50%;border:5px solid ${colorButton};border-radius:50%;border-top:5px solid ${colorButton};border-bottom:5px solid ${colorButton};border-left:5px solid transparent;border-right:5px solid transparent;width:${
                        buttonRect.height - 12
                    }px;height:${
                        buttonRect.height - 12
                    }px;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}@-webkit-keyframes spin{0%{-webkit-transform:translate(-50%,-50%) rotate(0)}100%{-webkit-transform:translate(-50%,-50%) rotate(360deg)}}@keyframes spin{0%{transform:translate(-50%,-50%) rotate(0)}100%{transform:translate(-50%,-50%) rotate(360deg)}}</style>`;
                }, _timeLoad);

                return button;
            }
    
            formElement = form;
            if (formElement) {
                var elements = formElement.querySelectorAll("[rules]");
                for (var selector of elements) {
                    var rules = selector.getAttribute("rules").split("||");
                    for (var rule of rules) {
                        var ruleInfo;
                        var isRuleHasValue = rule.includes("::");
                        if (isRuleHasValue) {
                            ruleInfo = rule.split("::");
                            rule = ruleInfo[0];
                        }
                        var ruleFunc = validatorRules[rule];
                        if (rule.includes("regex")) {
                            ruleFunc = validatorRules["regex"];
                        }
    
                        if (isRuleHasValue) {
                            var ruleFunc = ruleFunc(ruleInfo[1], formElement);
                        }
    
                        if (Array.isArray(formRules[selector.name])) {
                            formRules[selector.name].push(ruleFunc);
                        } else {
                            formRules[selector.name] = [ruleFunc];
                        }
                    }
                    //  Lắng nghe sự kiên validate (blur,change,onsubmit)
                    selector.onblur = handleValidateFocus;
                    selector.oninput = handleClearError;
                    selector.onchange = handleClearError;
                }
    
                formElement.onsubmit = formSubmit;
    
                function formSubmit(event) {
                    event.preventDefault();
                    var isValid = true;
                    var isValidCheck = true;
                    for (var selector of elements) {
                        if (!handleSubmitValidate({ target: selector })) {
                            isValid = false;
                        }
                    }
                    if (Object.keys(options).length != 0) {
                        options.rules.forEach(function (rule) {
                            var inputElements = formElement.querySelectorAll(
                                rule.selector
                            );
                            if (inputElements.length > 0) {
                                isValidCheck = validateRadioCheckBox(rule, true);
                                if (!isValidCheck) {
                                    isValidCheck = false;
                                }
                            }
                        });
                    }
                    if(hasFuncPlus == '' || callFunctionReturn(hasFuncPlus,formElement)){
                        isPass = true;
                    }else{
                        isPass = false;
                    }
                    
                    if (isValid && isValidCheck && isPass) {
                        var enableInputs = formElement.querySelectorAll(
                            "[name]:not([disabled])"
                        );
                        var formValues = Array.from(enableInputs).reduce(function (
                            values,
                            input
                        ) {
                            switch (input.type) {
                                case "radio":
                                    var radioChecked = formElement.querySelector(
                                        `input[name="${input.name}"]:checked`
                                    );
                                    if (radioChecked !== null) {
                                        values[input.name] = radioChecked.value;
                                    } else {
                                        values[input.name] = "";
                                    }
                                    break;
                                case "checkbox":
                                    if (input.matches(":checked")) {
                                        if (!Array.isArray(values[input.name])) {
                                            values[input.name] = [];
                                        }
                                        values[input.name].push(input.value);
                                    } else if (values[input.name] == undefined) {
                                        values[input.name] = "";
                                    }
                                    break;
                                case "file":
                                    values["image"] = input.files;
                                    inputFile = input.name;
                                    break;
                                default:
                                    values[input.name] = input.value;
                            }
                            return values;
                        },
                        {});
                        submitForm(formValues, formElement);
                    } else {
                        errorSelector = [];
                    }
                };
    
                if (Object.keys(options).length != 0) {
                    options.rules.forEach(function (rule) {
                        // Lưu lại các rules cho mỗi input
                        if (Array.isArray(selectorRules[rule.selector])) {
                            selectorRules[rule.selector].push(rule.check);
                        } else {
                            selectorRules[rule.selector] = [rule.check];
                        }
                        var inputElements = formElement.querySelectorAll(
                            rule.selector
                        );
                        Array.from(inputElements).forEach(function (inputElement) {
                            // Xử lý trường hợp blur khỏi input
                            inputElement.onchange = function () {
                                validateRadioCheckBox(rule, false);
                            };
                        });
                    });
                }
            }
    
            return {
                start: (function () {
                    changeImage();
                })(),
            };
        });
    }
    return {
        load:(function(){
            init();
        })(),
        setColor:function(options){
            setColor(options);
        },
        init:function(){
            init();
        }
    }
})();