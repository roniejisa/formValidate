const showError = function(json){
    let main = document.querySelector(".ajaxform.register-form").querySelectorAll("input,select");
    inputFirst = Array.from(main).filter(
        (input) => input.name == Object.keys(json)[0]
    );
    inputFirst[0].focus();
    for (const [key, value] of Object.entries(json)) {
        var input = Array.from(main).filter(
            (input) => input.name == key
        );
        var errorElement =
            input[0].parentElement.querySelector(".error-message");
        if (errorElement) {
            errorElement.remove();
        }
        var element = document.createElement("span");
        element.innerText = value;
        element.className = "error-message";
        element.style.color = "red";
        input[0].parentElement.insertBefore(element,input.nextSibling);
    }
}