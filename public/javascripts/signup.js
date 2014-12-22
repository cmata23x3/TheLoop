// PRIMARY AUTHOR: Mikael Mengistu


//Form validation
function validateForm() {

	var emailInput = document.forms["adduser"]["email"].value;
	if (emailInput==null || emailInput=="" || !isMITEmail(emailInput)) {
		document.getElementById("badEmail").removeAttribute("hidden", "false"); 
		return false;
	}

	var firstPassword = document.forms["adduser"]["password"].value;
	var secondPassword = document.forms["adduser"]["secondPassword"].value;
	if (matchedPasswords(firstPassword, secondPassword) == false) {
		document.getElementById("passwordsDontMatch").removeAttribute("hidden", "false"); 
		return false;
	}
	 location.reload(); 
};

function isMITEmail(email) {

	if(email.length > 8){
		var index = email.indexOf("@")
		var emailSuffix = email.substring(index+1, email.length);
		if  (emailSuffix === "mit.edu"){
			return true
		}
	}
		return false
};

function matchedPasswords(password1, password2){
	return password1 === password2;
}



function toggleSigninSignUp(signup){
	if (signup === true){
		
		document.getElementById("signIn").setAttribute("hidden", "true"); 
		document.getElementById("newUser").removeAttribute("hidden", "false"); 
	}
	else {
		document.getElementById("newUser").setAttribute("hidden", "true"); 
		document.getElementById("signIn").removeAttribute("hidden","true")
	}

}

function resetPasswordEmailCheck(){
	
	var emailInput = document.forms["adduser"]["email"].value;
	if (emailInput==null || emailInput=="" || !isMITEmail(emailInput)) {
		document.getElementById("badEmail").removeAttribute("hidden", "false"); 
		return false;
	}


}

