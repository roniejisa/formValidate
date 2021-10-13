"use strict";

var FORM_VALIDATION = ((options = {}) => {
	let _colorMain = "red";
	let _backgroundMain = "#010101";
	let _colorAbsolute = "#ffbaba";
	let _backgroundAbsolute = "#2c2c2c";
	let _typeFile = "image*";
	let _color = _colorMain;
	let _colorBorder = _colorMain;
	let _colorComment = _colorMain;
	let _colorBackground = _backgroundMain;
	let _borderRadius = "";
	let _timeLoad = 0;
	let _indexCurrent = null;
	options.rules = [
		isChecked('form[check] input[type="radio"]'),
		isChecked('form[check] input[type="checkbox"]'),
	];

	var validatorRules = {
		required: function (selector) {
			if (
				selector.type == "file" &&
				selector.getAttribute("input-file") == ""
			) {
				const form = getParent(selector, "form");
				const gallery = form.querySelector("[data-gallery]");
				const image = gallery.querySelectorAll("li");
				return image.length > 0
					? undefined
					: selector.getAttribute("m-required") || "Vui lòng nhập trường này";
			} else if (selector.hasAttribute("gallery")) {
				const form = getParent(selector, "form");
				const gallery = form.querySelector("div[class^='preview_img']");
				const img = gallery.querySelector("img");
				return img.src.trim !== ""
					? undefined
					: selector.getAttribute("m-required") || "Vui lòng nhập trường này";
			} else {
				return selector.value.trim()
					? undefined
					: selector.getAttribute("m-required") || "Vui lòng nhập trường này";
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
					: selector.getAttribute("m-same") || "Mật khẩu không giống nhau";
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
		phoneOrEmail: function (selector) {
			var isNumber = /^[0-9]+$/;
			var value = selector.value.trim();
			if (isNumber.test(value)) {
				var valueSelector = isNumber.test(value) && value.length >= 10;
			} else {
				var isEmail =
					/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				var valueSelector = isEmail.test(value);
			}
			return valueSelector
				? undefined
				: selector.getAttribute("m-phoneOr") ||
						"Không đúng định dạng email hoặc số điện thoại";
		},
		string: function (selector) {
			var isString =
				/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\W|_]+$/;
			return isString.test(selector.value.trim())
				? undefined
				: selector.getAttribute("m-phoneOr") || "Không đúng định dạng chữ viết";
		},
		regex: function (regex) {
			return function (selector) {
				return RegExp(regex).test(selector.value)
					? undefined
					: selector.getAttribute("m-regex") || `Không đúng định dạng quy định`;
			};
		},
	};

	function setStype() {
		var cssAnimation = document.createElement("style");
		cssAnimation.type = "text/css";
		var keyframes = document.createTextNode(
			`@-webkit-keyframes openErrorMessage {from { opacity:0; transform: translateY(15px) } to{opacity:1; transform: translateY(5px)} }
            .r-error-message[type="absolute"]::before{
                content: '';
                border-width: 8px 12px;
                position: absolute;
                border-color: transparent transparent ${_colorBackground} transparent;
                border-style: solid;
                left: 25%;
                bottom: 100%;
                transform: translateX(-50%);
            }`
		);
		cssAnimation.appendChild(keyframes);
		document.getElementsByTagName("head")[0].appendChild(cssAnimation);
	}

	function setColor(options) {
		_colorAbsolute = options.colorAbsolute || _colorAbsolute;
		_color = options.color || _colorMain;
		_colorBorder = options.colorBorder || _colorMain;
		_colorComment = options.colorComment || _colorMain;
		_colorBackground = options.colorBackground || _backgroundMain;
		_borderRadius = options.borderRadius || "";
		_timeLoad = options.timeLoad || 0;
		_typeFile = options.typeFile || _typeFile;
		setStype();
	}
	function isChecked(selector) {
		return {
			selector: selector,
			check: function (value, element) {
				let message = element.parentElement.getAttribute("m-checked")
					? element.parentElement.getAttribute("m-checked")
					: "Vui lòng nhập trường này";
				return value ? undefined : message;
			},
		};
	}

	function getParent(element, selector) {
		while (element.parentElement) {
			if (element.parentElement.matches(selector)) {
				return element.parentElement;
			}
			element = element.parentElement;
		}
	}

	function callFunction(func, data, dataForm, selector = "") {
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
	}

	function callFunctionReturn(func, data, dataForm, selector = "") {
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
	}

	function insertAfter(referenceNode, newNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}

	function appendError(referenceNode, newNode) {
		referenceNode.appendChild(newNode);
	}

	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	function init() {
		const formElements = document.querySelectorAll(".formValidation");
		Array.from(formElements).forEach((form) => {
			var formRules = {};
			var fileList = [];
			var formElement = null;
			var selectorRules = [];
			var errorSelector = [];
			var editImage = form.hasAttribute("files") ? true : false;
			var inputFile;
			var isAbsolute = form.hasAttribute("absolute") ? true : false;
			if (isAbsolute) {
				setColor({
					color: _colorAbsolute,
					colorBackground: _backgroundAbsolute,
					colorBorder: _colorAbsolute,
				});
			}
			var isClear = form.hasAttribute("clear") ? true : false;
			var hasFuncPlus = form.hasAttribute("plus")
				? form.getAttribute("plus")
				: null;
			let isPass;
			function validateRadioCheckBox(rule, isSubmit) {
				var rules = selectorRules[rule.selector];
				var inputElement = formElement.querySelector(rule.selector);
				var errorMessage;
				for (var i in rules) {
					switch (inputElement.type) {
						case "radio":
						case "checkbox":
							errorMessage = rules[i](
								formElement.querySelector(rule.selector + ":checked"),
								inputElement
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
			}

			function configErrorElement(errorElement) {
				errorElement.className = "r-error-message";
				Object.assign(errorElement.style, {
					pointerEvents: "none",
					color: _color,
					display: "block",
					fontSize: "14px",
					lineHeight: "16px",
					padding: "4px 0",
					textAlign: "left",
					textShadow: "1px 1px #00000030",
					zIndex: 10,
					animation: "0.3s openErrorMessage ease-in-out forwards",
				});
			}

			function actionHasParentElement(
				parentElement,
				errorMessage,
				selector,
				isSubmit = true
			) {
				var errorElement = document.createElement("span");
				configErrorElement(errorElement);
				if (isAbsolute) {
					styleElementErrorAbsolute(selector, errorElement);
				}
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
			}

			function styleElementErrorAbsolute(selector, error) {
				error.setAttribute("type", "absolute");

				Object.assign(error.style, {
					position: "absolute",
					// boxShadow:"0 0 3px",
					padding: "4px 32px 6px 18px",
					borderRadius: _borderRadius,
					background: _colorBackground,
					maxWidth: "80%",
					wordBreak: "break-word",
					top:
						(selector.offsetTop !== 0
							? selector.offsetTop
							: selector.parentElement.offsetTop) +
						(selector.clientHeight !== 0
							? selector.clientHeight
							: selector.parentElement.clientHeight) +
						"px",
					left:
						(selector.offsetLeft !== 0
							? selector.offsetLeft
							: selector.parentElement.offsetLeft) + "px",
				});
			}

			function actionNoParentElement(errorMessage, selector, isSubmit = true) {
				var errorElement = document.createElement("span");
				configErrorElement(errorElement);
				if (isAbsolute) {
					styleElementErrorAbsolute(selector, errorElement);
				}
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
							if (selector.nextSibling.className !== "r-error-message") {
								insertAfter(selector, errorElement);
								selector.style.border = "1.68px solid " + _colorBorder;
							}
							break;
					}
				}
			}

			function handleClearError(event) {
				var parentElement = false;
				if (formElement.hasAttribute("parent")) {
					parentElement = getParent(
						event.target,
						formElement.getAttribute("parent")
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
						if (event.target.nextSibling.className === "r-error-message") {
							event.target.style.removeProperty("border");
							removeStyle(event.target.nextSibling);
						} else if (
							parentElement &&
							parentElement.querySelector(".r-error-message")
						) {
							var parentElement = getParent(
								event.target,
								formElement.getAttribute("parent")
							);
							removeStyle(parentElement.querySelector(".r-error-message"));
							event.target.style.removeProperty("border");
						}
						break;
				}
			}

			function removeStyle(element) {
				element.animate([{ opacity: 0, transform: "translateY(10px)" }], {
					duration: 300,
					fill: "forwards",
				}).onfinish = function () {
					element.remove();
				};
			}

			function handleValidateFocus(event) {
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
				if (formElement.hasAttribute("parent")) {
					parentElement = getParent(
						selector,
						formElement.getAttribute("parent")
					);
				}
				if (parentElement) {
					actionHasParentElement(parentElement, errorMessage, selector, false);
				} else {
					actionNoParentElement(errorMessage, selector, false);
				}
				return !errorMessage;
			}

			function handleSubmitValidate(event) {
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
				if (formElement.hasAttribute("parent")) {
					parentElement = getParent(
						selector,
						formElement.getAttribute("parent")
					);
				}
				if (parentElement) {
					actionHasParentElement(parentElement, errorMessage, selector, true);
				} else {
					actionNoParentElement(errorMessage, selector, true);
				}
				return !errorMessage;
			}

			function changeImage() {
				if (editImage) {
					let galleryPhotoInput = form.querySelector("[input-file]");
					let placeGallery = form.querySelector("[data-gallery]");
					inputFile = galleryPhotoInput.name;
					galleryPhotoInput.onchange = function (e) {
						pushFileList(placeGallery, e.target.files);
						galleryPhotoInput.value = null;
					};
				}
			}

			function pushFileList(placeGallery, files) {
				Array.from(files).forEach(function (file) {
					if (file.type.match(_typeFile)) {
						fileList.push(file);
					}
				});
				if (fileList.length > 0) {
					elementGallery(placeGallery);
					setFileList(placeGallery);
				}
			}

			function setFileList(placeGallery) {
				const list = setListItem();
				fileList.forEach((file, i) => {
					var li = document.createElement("li");
					var divImage = document.createElement("div");
					var divAction = document.createElement("div");
					var img = document.createElement("img");
					img.src = window.URL.createObjectURL(file);
					var button = document.createElement("button");
					elementButton(button);
					elementDivPreview(divImage);
					elementDivAction(divAction, button, li, img, file);
					elementLi(li);
					divImage.appendChild(img);
					li.appendChild(divImage);
					li.appendChild(divAction);
					list.appendChild(li);

					button.onclick = function (e) {
						e.stopPropagation();
						if (fileList.length == 1) {
							list.remove("style");
							placeGallery.removeAttribute("style");
							fileList = [];
						}
						fileList.splice(i, 1);
						li.remove();
					};
				});
				onLightbox(placeGallery, list);
			}

			function onLightbox(placeGallery, list) {
				placeGallery.appendChild(list);
				const images = list.querySelectorAll("li");
				images.forEach(function (imageElement, index) {
					imageElement.onclick = function (event) {
						event.stopPropagation();
						_indexCurrent = index;
						zoomImg(imageElement, images);
					};
				});
			}

			function zoomImg(selector, galleries) {
				const img = selector.querySelector("img");
				var gallery = document.createElement("div");
				var imgElement = document.createElement("div");
				var closeLightBoxButton = document.createElement("button");
				var buttonLeft = document.createElement("button");
				var buttonRight = document.createElement("button");
				styleButtonChange(buttonLeft, "left", galleries, imgElement);
				styleButtonChange(buttonRight, "right", galleries, imgElement);

				gallery.className = "img-preview";
				imgElement.className = "img-preview__bg";
				buttonAction(closeLightBoxButton, gallery, imgElement, selector);

				elementImage(imgElement, img.src, gallery);
				galleryImage(gallery, selector);
				gallery.appendChild(imgElement);
				gallery.appendChild(closeLightBoxButton);
				gallery.appendChild(buttonLeft);
				gallery.appendChild(buttonRight);
				document.querySelector("body").appendChild(gallery);
			}

			function styleButtonChange(button, position, galleries, imgElement) {
				Object.assign(button.style, {
					position: "absolute",
					top: "50%",
					transform: "translateY(-50%)",
					background: _color,
					padding: "15px 8px",
					border: "none",
					color: _colorBackground,
					transition: "all 300ms ease-out",
					cursor: "pointer",
				});

				button.onmousemove = function () {
					button.style.boxShadow = "0 0 3px " + _color;
				};

				button.onmouseleave = function () {
					button.style.boxShadow = "inherit";
				};

				if (position == "right") {
					button.innerHTML = `<svg style="display: block;height: 24px; width: 24px; viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg>`;
					button.style.right = "16px";
				} else {
					button.style.left = "16px";
					button.innerHTML = `<svg style="transform:scaleX(-1); display: block;height: 24px; width: 24px; viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg>`;
				}

				button.onclick = function (e) {
					e.stopPropagation();
					if (position == "right") {
						_indexCurrent++;
						_indexCurrent =
							_indexCurrent > galleries.length - 1 ? 0 : _indexCurrent;
					} else {
						_indexCurrent--;
						_indexCurrent =
							_indexCurrent < 0 ? galleries.length - 1 : _indexCurrent;
					}
					if (position == "right") {
						var startAnimate = "translateX(100%)";
						var endAnimate = "translateX(-100%) scale(0)";
					} else {
						var startAnimate = "translateX(-100%)";
						var endAnimate = "translateX(100%) scale(0)";
					}
					const animateChange = imgElement.animate(
						[
							{
								transform: startAnimate,
							},
						],
						{
							duration: 200,
							fill: "forwards",
						}
					);

					animateChange.onfinish = function () {
						imgElement.style.backgroundImage = `url(${
							galleries[_indexCurrent].querySelector("img").src
						}), linear-gradient(0deg,white,white)`;

						const animateFinish = imgElement.animate(
							[{ transform: endAnimate }, { transform: "translateX(0%)" }],
							{
								duration: 300,
								fill: "forwards",
							}
						);

						animateFinish.onfinish = function () {
							sleep(0)
								.then(function () {
									animateFinish.cancel();
									return sleep(300);
								})
								.then(function () {
									styleHoverImage(imgElement);
								});
						};
					};
				};
			}

			function buttonAction(button, gallery, imgElement, selector) {
				button.innerHTML = "x";
				Object.assign(button.style, {
					position: "absolute",
					color: "white",
					background: "#01010150",
					zIndex: 1,
					padding: "6px 10px",
					fontSize: "24px",
					fontWeight: "bold",
					cursor: "pointer",
					top: "15px",
					right: "15px",
					border: "none",
					borderRadius: _borderRadius,
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
					const imageAnimate = imgElement.animate(
						[
							{ transform: "scale(1)", opacity: 1 },
							{ transform: "scale(0)", opacity: 0 },
						],
						{
							duration: 300,
							fill: "forwards",
						}
					);
					imageAnimate.onfinish = function () {
						const galleryAnimate = gallery.animate(
							[
								{ transform: "scale(1)" },
								{ transform: "scale(0)", opacity: 0 },
							],
							{
								duration: 300,
							}
						);
						galleryAnimate.onfinish = function () {
							gallery.remove();
							selector.style.pointerEvents = "all";
						};
					};
				};
			}

			function elementImage(imgElement, img) {
				Object.assign(imgElement.style, {
					width: "50%",
					paddingBottom: "28%",
					borderRadius: _borderRadius,
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
					cursor: "grab",
				});

				styleHoverImage(imgElement);

				imgElement.src = img;
				imgElement.addClass;
				imgElement.onclick = function (e) {
					e.stopPropagation();
				};
			}

			function styleHoverImage(imgElement) {
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
			}

			function galleryImage(gallery, selector) {
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
					zIndex: 1060,
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
						[{ transform: "scale(1)" }, { transform: "scale(0)", opacity: 0 }],
						{
							duration: milisecond,
							iterations: 1,
						}
					);
					setTimeout(() => {
						gallery.remove();
					}, milisecond - 100);
				};
			}

			function setListItem() {
				var list = document.createElement("ul");
				elementList(list);
				return list;
			}

			function elementList(list) {
				var styleElement = document.createElement("style");
				styleElement.appendChild(
					document.createTextNode(
						"div ::-webkit-scrollbar {display:none;-webkit-appearance: none}"
					)
				);

				Object.assign(list.style, {
					display: "grid",
					listStyle: "none",
					gridAutoFlow: "column",
					padding: "16px",
					overflow: "auto",
					gridGap: "16px",
					gridAutoColumns: "120px",
				});
				list.append(styleElement);
				dragList(list);
			}

			function dragList(slider) {
				let isDown = false;
				let startX;
				let scrollLeft;
				let selectTarget;
				slider.addEventListener("mousedown", (e) => {
					e.preventDefault();
					selectTarget = e.target;
					isDown = true;
					slider.style.cursor = "grap";
					startX = e.pageX - slider.offsetLeft;
					scrollLeft = slider.scrollLeft;
				});

				slider.addEventListener("mouseleave", (e) => {
					e.preventDefault();
					isDown = false;
					swapLink(isDown);
				});

				slider.addEventListener("mouseup", (e) => {
					e.preventDefault();
					isDown = false;
					swapLink(isDown);
				});

				slider.addEventListener("mousemove", (e) => {
					if (!isDown) return;
					swapLink(isDown);
					e.preventDefault();
					const x = e.pageX - slider.offsetLeft;
					const walk = (x - startX) * 1; //scroll-fast
					slider.scrollLeft = scrollLeft - walk;
				});

				function swapLink(drag) {
					if (drag) {
						if (
							selectTarget.hasAttribute("href") &&
							!selectTarget.hasAttribute("data-href")
						) {
							selectTarget.setAttribute(
								"data-href",
								selectTarget.getAttribute("href")
							);
							selectTarget.href = "javascript:void(0)";
						}
					} else {
						setTimeout(() => {
							if (
								selectTarget instanceof Element &&
								selectTarget.hasAttribute("data-href")
							) {
								selectTarget.setAttribute(
									"href",
									selectTarget.getAttribute("data-href")
								);
								selectTarget.removeAttribute("data-href");
							}
						}, 100);
					}
				}
			}

			function elementGallery(gallery) {
				Object.assign(gallery.style, {
					border: "2px dashed " + _colorComment,
					margin: "12px 0",
					cursor: "pointer",
					borderRadius: _borderRadius,
					transition: "all 0.3s ease-in-out",
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
					pushFileList(gallery, e.dataTransfer.files);
				};

				gallery.onclick = function () {
					form.querySelector("[input-file]").click();
				};
				gallery.innerHTML = "";
			}

			function elementDivPreview(divImage) {
				Object.assign(divImage.style, {
					position: "relative",
					display: "block",
					borderRadius: _borderRadius,
					paddingBottom: "100%",
					boxShadow: "0 0 3px #00000030",
				});
			}

			function elementDivAction(divAction, button, li, img, file) {
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
					borderRadius: _borderRadius,
					overflow: "hidden",
				});

				Object.assign(progressLength.style, {
					background: "white",
					height: "100%",
					width: 0,
				});

				progress.appendChild(progressLength);
				divAction.appendChild(progress);

				const progressAnimateFirst = progressLength.animate(
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

				progressAnimateFirst.onfinish = function () {
					const progressAnimateTwo = progressLength.animate(
						[
							{
								opacity: 0,
							},
						],
						{
							duration: 300,
							fill: "forwards",
						}
					);

					progressAnimateTwo.onfinish = function () {
						progress.remove();
						afterShowImage(li, button, pName, pSize, img);
						divAction.appendChild(button);
						divAction.appendChild(pName);
						divAction.appendChild(pSize);
					};
				};
			}

			function afterShowImage(li, button, pName, pSize, img) {
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
				// li.onclick = (e) => {
				// 	e.stopPropagation();
				// 	li.style.pointerEvents = "none";
				// 	zoomImg(img.src, li);
				// };
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
			}

			function elementName(name) {
				name.title = name.innerText;
				Object.assign(name.style, {
					width: "75%",
					borderRadius: _borderRadius,
					marginTop: "24px",
					padding: "4px 10px",
					background: "#ffffff9e",
					color: "#0e0e0e",
					opacity: 0,
					marginBottom: "8px",
					fontSize: "12px",
					display: "block",
					overflow: "hidden",
					textAlign: "center",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					transition: "all 0.3s",
				});
			}

			function elementSize(size) {
				Object.assign(size.style, {
					width: "75%",
					borderRadius: _borderRadius,
					padding: "4px 10px",
					fontSize: "12px",
					background: "#ffffff9e",
					textAlign: "center",
					color: "#0e0e0e",
					opacity: 0,
					display: "-webkit-box",
					webkitLineClamp: 1,
					webkitBoxOrient: "vertical",
					transition: "all 0.3s",
				});
			}

			function elementLi(li) {
				Object.assign(li.style, {
					position: "relative",
					display: "inline-block",
					verticalAlign: "top",
				});
			}

			function elementImg(img) {
				Object.assign(img.style, {
					position: "absolute",
					inset: 0,
					width: "100%",
					height: "100%",
					objectFit: "cover",
					filter: "blur(1px)",
					transition: "all 0.3s",
					borderRadius: _borderRadius,
				});
			}

			function elementButton(button) {
				button.innerHTML = `x`;
				button.type = "button";
				Object.assign(button.style, {
					position: "absolute",
					right: "8px",
					top: "8px",
					cursor: "pointer",
					background: _colorComment,
					border: "1.68px solid " + _colorComment,
					boxShadow: "0.2px 0.2px 6px 0.2px " + _colorComment,
					color: "white",
					height: "20px",
					width: "20px",
					fontWeight: "bold",
					fontSize: "8px",
					opacity: "0",
					borderRadius: _borderRadius,
					transition: "all 0.3s",
					padding: 0,
				});

				button.onmouseover = function () {
					Object.assign(button.style, {
						border: "1.68px solid " + _colorComment,
						boxShadow: "0.2px 0.2px 6px 0.2px " + _colorComment,
						transform: "scale(1.05)",
					});
				};
				button.onmouseleave = function () {
					Object.assign(button.style, {
						border: "1.68px solid " + _colorComment,
						boxShadow: "0.2px 0.2px 6px 0.2px " + _colorComment,
					});
				};
			}

			function clearForm(form) {
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
			}

			function getStyle(element, property) {
				return window
					.getComputedStyle(element, null)
					.getPropertyValue(`'${property}'`);
			}

			function submitForm(data, formElement) {
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
					button.removeAttribute("style");
					if (button.hasAttribute("style-old")) {
						button.setAttribute("style", button.getAttribute("style-old"));
					}
					button.innerHTML = button.getAttribute("content-old");
					button.disabled = false;

					if (ajax.readyState === XMLHttpRequest.DONE) {
						var status = ajax.status;
						if (status === 0 || (status >= 200 && status < 400)) {
							const dataResponse = JSON.parse(ajax.responseText);
							if (
								isClear &&
								"code" in dataResponse &&
								dataResponse.code == 200
							) {
								const boxGallery = form.querySelectorAll("[data-gallery]");
								if (
									boxGallery.length > 0 &&
									boxGallery[0].querySelectorAll("ul").length > 0
								) {
									fileList = [];
									boxGallery[0].querySelector("ul").innerHTML = "";
									boxGallery[0].removeAttribute("style");
								}
								clearForm(formElement);
							}
							return callFunction(check, dataResponse, data, formElement);
						} else {
							alert("Xảy ra lỗi rồi");
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
			}

			function buttonFormBeforeSubmit(button) {
				if (button.getAttribute("style")) {
					button.setAttribute("style-old", button.getAttribute("style"));
				}

				const buttonRect = button.getBoundingClientRect();
				Object.assign(button.style, {
					width: `${buttonRect.width}px`,
					height: `${buttonRect.height}px`,
					position: `relative`,
					display: "inline-block",
				});

				if (button.hasAttribute("content")) {
					button.setAttribute("content-old", button.getAttribute("content"));
				} else {
					button.setAttribute("content-old", button.innerHTML);
				}
				button.disabled = true;
				const colorButton = getStyle(button, "color");
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
				var elements = formElement.querySelectorAll("[rules]:not([disabled])");
				for (var selector of elements) {
					var rules = selector.getAttribute("rules").split("||");
					for (var rule of rules) {
						var ruleInfo;
						var isRuleHasValue = rule.includes(":");
						if (isRuleHasValue) {
							ruleInfo = rule.split(":");
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
					//  Lắng nghe sự kiên validate (blur,change,click)
					selector.onblur = handleValidateFocus;
					selector.oninput = handleClearError;
					selector.onclick = handleClearError;
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
							var inputElements = formElement.querySelectorAll(rule.selector);
							if (inputElements.length > 0) {
								isValidCheck = validateRadioCheckBox(rule, true);
								if (!isValidCheck) {
									isValidCheck = false;
								}
							}
						});
					}

					if (
						hasFuncPlus == null ||
						callFunctionReturn(hasFuncPlus, formElement)
					) {
						isPass = true;
					} else {
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
				}

				if (Object.keys(options).length != 0) {
					options.rules.forEach(function (rule) {
						// Lưu lại các rules cho mỗi input
						if (Array.isArray(selectorRules[rule.selector])) {
							selectorRules[rule.selector].push(rule.check);
						} else {
							selectorRules[rule.selector] = [rule.check];
						}
						var inputElements = formElement.querySelectorAll(rule.selector);
						Array.from(inputElements).forEach(function (inputElement) {
							// Xử lý trường hợp blur khỏi input
							inputElement.onchange = function () {
								validateRadioCheckBox(rule, false);
							};
						});
					});
				}
			}

			function clearErrorElement() {
				formElement
					.querySelectorAll("[name]:not([disabled])")
					.forEach(
						(e) => e.hasAttribute("style") && e.removeAttribute("style")
					);
				formElement
					.querySelectorAll(".r-error-message")
					.forEach((e) => removeStyle(e));
			}
			return {
				start: (function () {
					changeImage();
					clearErrorElement();
				})(),
			};
		});
	}

	return {
		load: (function () {
			init();
		})(),
		setColor: function (options) {
			setColor(options);
		},
		refresh: function () {
			init();
		},
	};
})();
