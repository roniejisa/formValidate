((options = {}) => {
	var validatorRules = {
		required: function (selector) {
			return selector.value.trim()
				? undefined
				: selector.getAttribute("m-required") || "Vui lòng nhập trường này";
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
	};

	var isChecked = function (selector, message) {
		return {
			selector: selector,
			check: function (value) {
				return value ? undefined : message || "Vui lòng nhập trường này";
			},
		};
	};

	var callFunction = function (func, data, selector) {
		var arrayFunc = func.split(".");
		if (arrayFunc.length === 1) {
			var func = arrayFunc[0];
			null != window[func] &&
				typeof window[func] === "function" &&
				window[func](data, selector);
		} else if (func.length === 2) {
			var obj = func[0];
			func = func[1];
			window[r] != null &&
				typeof window[obj] === "object" &&
				null != window[obj][func] &&
				typeof window[obj][func] === "function" &&
				window[obj][func](data, selector);
		}
	};

	options.rules = [
		isChecked('input[type="radio"]'),
		isChecked('input[type="checkbox"]'),
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
		var formElement = null;
		var selectorRules = [];
		var errorSelector = [];
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

		var submitForm = function (data, formElement) {
			var check = formElement.getAttribute("data-sucess");
			if (!check) {
				formElement.submit();
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
						return callFunction(check, ajax.responseText, formElement);
					} else {
						console.log("lỗi");
					}
				}
				button.innerHTML = button.getAttribute("content-old");
			};
			var formData = new FormData();
			console.log(data);
			for (const [key, value] of Object.entries(data)) {
				formData.append(key, value);
			}
			Object.assign(button.style, {
				width: `${button.offsetWidth}px`,
				height: `${button.offsetHeight}px`,
				position: `relative`,
				display: "inline-block",
			});
			button.setAttribute("content-old", button.innerHTML);
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
				var rules = selector.getAttribute("rules").split("|");
				for (var rule of rules) {
					var ruleInfo;
					var isRuleHasValue = rule.includes(":");
					if (isRuleHasValue) {
						ruleInfo = rule.split(":");
						rule = ruleInfo[0];
					}

					var ruleFunc = validatorRules[rule];

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
							var isValid = validateRadioCheckBox(rule, true);
							if (!isValid) {
								isFormValid = false;
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
								values[input.name] = input.files;
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
	});
})();
