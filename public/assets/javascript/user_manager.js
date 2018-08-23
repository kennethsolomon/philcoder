"use strict";

class UserManager {
  constructor(theUser) {
    this.theUser = theUser;  
    $('#btnreg').click(() => this.signup());
    $('#btnlogin').click(() => this.login());
    $('#btn-log-g').click(() => this.loginwithgoogle());
    $('#btnsignout').click(() => this.signout());
  }

  // register a new user
  signup(){
    var data = {
        email    : $('#txtemail').val(),
        password : $('#txtpass').val(),
        repassword : $('#txtrepass').val()
    };

    if(data.password === data.repassword){
        firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
        .then( function(user){
            //console.log("Authenticated successfully with payload:", user);
            $('#regmodal').modal('hide');
            $('#txtemail').val("");
            $('#txtpass').val("");
            $('#txtrepass').val("");
            alert("Authenticated successfully with user: "+ user);
            //theUser = user;			
        })			
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            //console.log("error baba: " + errorMessage);
            alert("error code:" + errorCode+ " msg:" + errorMessage);
            // ...
        });
    }else{
        alert("Password don't match");
    }		
  }

  // sign-in a user
  login(){
    var data = {
        email    : $('#txtlemail').val(),
        password : $('#txtlpass').val(),
    };
            
    firebase.auth().signInWithEmailAndPassword(data.email, data.password)
    .then( function(user){
          $('#loginmodal').modal('hide');
          $('#txtlemail').val("");
          $('#txtlpass').val("");
          //alert("welcome");
          //location.href = "profile.html";
    })	
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert("error code:" + errorCode + " msg:" + errorMessage);
      //alert("error code:" + data.email + " msg:" + errorMessage);
      // ...
    });
  }

  // sign in with google account
  loginwithgoogle(){			
    //alert("User is not sign in");
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result){
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
      //location.href = "profile.html";
    }).catch(function(){
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });																	
  }

  //sign out a user
  signout(){
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
    }).catch(function(error) {
      // An error happened.
    });
  }
 
}