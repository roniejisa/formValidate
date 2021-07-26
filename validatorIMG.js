((options = {}) => {
	var validatorRules = {
		required: function (selector) {
			if (
				selector.type == "file" &&
				selector.getAttribute("input-file") == ""
			) {
				form = getParent(selector, "form");
				gallery = form.querySelector("[data-gallery]");
				image = gallery.querySelectorAll("li");
				return image.length > 0
					? undefined
					: selector.getAttribute("m-required") || "Vui lòng nhập trường này";
			} else {
				return selector.value.trim()
					? undefined
					: selector.getAttribute("m-required") || "Vui lòng nhập trường này";
			}
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
		regex: function (regex) {
			return function (selector) {
				return RegExp(regex).test(selector.value)
					? undefined
					: selector.getAttribute("m-regex") || `Không đúng định dạng quy định`;
			};
		},
	};

	var isChecked = function (selector, message) {
		return {
			selector: selector,
			check: function (value) {
				return value ? undefined : message || "Vui lòng nhập trường này";
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

	var callFunction = function (func, data, selector) {
		var arrayFunc = func.split(".");
		if (arrayFunc.length === 1) {
			var func = arrayFunc[0];
			null != window[func] &&
				typeof window[func] === "function" &&
				window[func](data, selector);
		} else if (arrayFunc.length === 2) {
			var obj = arrayFunc[0];
			func = arrayFunc[1];
			window[obj] != null &&
				typeof window[obj] === "object" &&
				null != window[obj][func] &&
				typeof window[obj][func] === "function" &&
				window[obj][func](data, selector);
		}
	};

	options.rules = [
		isChecked('input[type="radio"][rules="required"]'),
		isChecked('input[type="checkbox"][rules="required"]'),
	];

	var cssAnimation = document.createElement("style");
	cssAnimation.type = "text/css";
	var keyframes = document.createTextNode(
		`@-webkit-keyframes openErrorMessage {from { opacity:0; } to{opacity:1} }`
	);
	cssAnimation.appendChild(keyframes);
	document.getElementsByTagName("head")[0].appendChild(cssAnimation);
	formElements = document.querySelectorAll(".formValidation");
	Array.from(formElements).forEach((form) => {
		var formRules = {};
		var fileList = [];
		var formElement = null;
		var selectorRules = [];
		var errorSelector = [];
		var editImage = form.dataset.file == "" ? true : false;
		var inputFile;
		var validateRadioCheckBox = function (rule, isSubmit) {
			var rules = selectorRules[rule.selector];
			var inputElement = formElement.querySelector(rule.selector);
			var errorMessage;
			for (var i in rules) {
				switch (inputElement.type) {
					case "radio":
					case "checkbox":
						errorMessage = rules[i](
							formElement.querySelector(rule.selector + ":checked")
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
			referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		};

		var actionNoParentElement = function (
			errorMessage,
			selector,
			isSubmit = true
		) {
			var errorElement = document.createElement("span");
			errorElement.className = "r-error-message";
			Object.assign(errorElement.style, {
				color: "red",
				display: "block",
				fontSize: "14px",
				lineHeight: "16px",
				padding: "4px 0",
				textAlign: "left",
				animation: "0.3s openErrorMessage ease-in-out forwards",
			});
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
							selector.parentElement.nextSibling.className !== "r-error-message"
						) {
							insertAfter(selector.parentElement, errorElement);
						}
						break;
					default:
						if (selector.nextSibling.className !== "r-error-message") {
							insertAfter(selector, errorElement);
							selector.style.border = "1px solid red";
						}
						break;
				}
			}
		};

		var handleClearError = function (event) {
			switch (event.target.type) {
				case "checkbox":
				case "radio":
					if (
						event.target.parentElement.nextSibling.className ===
						"r-error-message"
					) {
						event.target.parentElement.nextSibling.remove();
					}
					break;
				default:
					if (event.target.nextSibling.className === "r-error-message") {
						event.target.style.removeProperty("border");
						event.target.nextSibling.remove();
					}
					break;
			}
		};

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
			actionNoParentElement(errorMessage, selector, false);
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

			actionNoParentElement(errorMessage, selector, true);
			return !errorMessage;
		};

		var changeImage = function () {
			if (editImage) {
				let galleryPhotoInput = form.querySelector("[input-file]");
				let placeGallery = form.querySelector("[data-gallery]");
				inputFile = galleryPhotoInput.name;
				galleryPhotoInput.onchange = function (e) {
					fileList.push(...e.target.files);
					setFileList(placeGallery);
					galleryPhotoInput.value = "";
				};
			}
		};

		var buttonImage = function (button, gallery, imgElement, selector) {
			Object.assign(button.style, {
				position: "absolute",
				color: "#1b1010",
				background: "rgba(255, 255, 255, 0.314)",
				zIndex: 1,
				padding: "5px 10px",
				fontSize: "1.5vw",
				fontWeight: "bold",
				top: "15px",
				right: "15px",
				border: "none",
			});
			button.onmousemove = function () {
				button.animate(
					[
						{
							color: "black",
							backgroundColor: "white",
							boxShadow: "0px 0px 5px 2px #696969",
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
							color: "black",
							boxShadow: "none",
							background: "rgba(255, 255, 255, 0.314)",
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
					[{ transform: "scale(1)" }, { transform: "scale(0)", opacity: 0 }],
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
				width: "55%",
				paddingBottom: "30%",
				height: "0",
				backgroundRepeat: "no-repeat",
				backgroundSize: "contain",
				backgroundPosition: "center",
				transition: "box-shadow 0.1s, transform 0.1s",
				boxShadow: "#696969 -1px 2px 5px 2px",
				margin: "0 auto",
				border: "0.5vw solid white",
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
				background: "#00000050",
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				top: 0,
				left: 0,
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
		};

		var zoomImg = function (img, selector) {
			var gallery = document.createElement("div");
			var imgElement = document.createElement("div");
			var button = document.createElement("button");
			gallery.className = "img-preview";
			imgElement.className = "img-preview__bg";
			button.innerHTML = "✘";
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
			Object.assign(list.style, {
				display: "flex",
				flexWrap: "wrap",
				listStyle: "none",
				margin: "12px -16px",
				padding: 0,
			});
		};

		var elementGallery = function (gallery) {
			Object.assign(gallery.style, {
				display: "flex",
				padding: "32px",
				border: "3px dashed blue",
				margin: "12px 0",
				cursor: "pointer",
			});

			gallery.ondragover = function () {
				this.style.borderColor = "green";
				return false;
			};
			gallery.ondragleave = function () {
				this.style.borderColor = "blue";
				return false;
			};
			gallery.ondragend = function (e) {
				e.preventDefault();
				return false;
			};
			gallery.ondrop = function (e) {
				e.preventDefault();
				fileList.push(...Array.from(e.dataTransfer.files));
				setFileList(gallery);
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
				overflow: "hidden",
				borderRadius: "10px",
				width: "120px",
				height: "120px",
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
				borderRadius: "10px",
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
					return sleep(1000);
				})
				.then(() => {
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
				img.style.filter = "blur(5px)";
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
				width: "60%",
				borderRadius: "5px",
				padding: "4px 10px",
				background: "#ffffff9e",
				color: "#0e0e0e",
				opacity: 0,
				marginBottom: "8px",
				display: "block",
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap",
				transition: "all 0.3s",
			});
		};

		var elementSize = function (size) {
			Object.assign(size.style, {
				width: "60%",
				borderRadius: "5px",
				padding: "4px 10px",
				background: "#ffffff9e",
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
				padding: "0 16px",
				minHeight: "100px",
				marginTop: "16px",
			});
		};

		var elementImg = function (img) {
			Object.assign(img.style, {
				width: "100%",
				height: "100%",
				objectFit: "cover",
				filter: "blur(1px)",
				transition: "all 0.3s",
			});
		};

		var elementButton = function (button) {
			button.innerHTML = `✘`;
			Object.assign(button.style, {
				position: "absolute",
				right: "26px",
				top: "2px",
				cursor: "pointer",
				background: "hotpink",
				border: "1px solid hotpink",
				boxShadow: "0px 0px 3px 1px hotpink",
				color: "white",
				padding: "0px 2px",
				marginTop: "8px",
				fontSize: "10px",
				opacity: "0",
				borderRadius: "100%",
				transition: "all 0.3s",
			});

			button.onmouseover = function () {
				Object.assign(button.style, {
					background: "black",
					border: "1px solid black",
					boxShadow: "0px 0px 3px 1px black",
					color: "hotpink",
				});
			};
			button.onmouseleave = function () {
				Object.assign(button.style, {
					background: "hotpink",
					border: "1px solid hotpink",
					boxShadow: "0px 0px 3px 1px hotpink",
					color: "white",
				});
			};
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
				if (ajax.readyState === XMLHttpRequest.DONE) {
					var status = ajax.status;
					if (status === 0 || (status >= 200 && status < 400)) {
						return callFunction(check, JSON.parse(ajax.responseText), formElement);
					} else {
						console.log("lỗi");
					}
				}
				button.disabled = false;
				button.innerHTML = button.getAttribute("content-old");
			};
			var formData = new FormData();

			if (editImage) {
				Array.from(fileList).forEach(function (file) {
					formData.append(inputFile + "[]", file);
				});
			} else if(data.image){
				Array.from(data.image).forEach(function (file) {
					formData.append(inputFile + "[]", file);
				});
			}

			for (const [key, value] of Object.entries(data)) {
				if (key !== "image") {
					formData.append(key, value);
				}
			}

			Object.assign(button.style, {
				width: `${button.offsetWidth}px`,
				height: `${button.offsetHeight}px`,
				position: `relative`,
				display: "inline-block",
			});
			button.setAttribute("content-old", button.innerHTML);
			button.disabled = true;
			button.innerHTML = `<div class="r-s-loader"></div><style>.r-s-loader{position:absolute;left:50%;top:50%;border:5px solid #f3f3f3;border-radius:50%;border-top:5px solid #fff;border-bottom:5px solid #fff;border-left:5px solid transparent;border-right:5px solid transparent;width:${
				button.offsetHeight - 16
			}px;height:${
				button.offsetHeight - 16
			}px;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}@-webkit-keyframes spin{0%{-webkit-transform:translate(-50%,-50%) rotate(0)}100%{-webkit-transform:translate(-50%,-50%) rotate(360deg)}}@keyframes spin{0%{transform:translate(-50%,-50%) rotate(0)}100%{transform:translate(-50%,-50%) rotate(360deg)}}</style>`;
			ajax.send(formData);
		};

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
			}

			formElement.onsubmit = function (event) {
				event.preventDefault();
				var isValid = true;
				for (var selector of elements) {
					if (!handleSubmitValidate({ target: selector })) {
						isValid = false;
					}
				}
				if (Object.keys(options).length != 0) {
					options.rules.forEach(function (rule) {
						var inputElements = formElement.querySelectorAll(rule.selector);
						if (inputElements.length > 0) {
							isValid = validateRadioCheckBox(rule, true);
							if (!isValid) {
								isValid = false;
							}
						}
					});
				}
				if (isValid) {
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

		return {
			start: (function () {
				changeImage();
			})(),
		};
	});
})();