$(function() { 
    'use strict';

    // Initialize Firebase
    var config = {
    apiKey: "AIzaSyAvOHnQZiM48s3qkmMhycv4K6Ehi-lrhtc",
    authDomain: "chat-477b2.firebaseapp.com",
    databaseURL: "https://chat-477b2.firebaseio.com",
    projectId: "chat-477b2",
    storageBucket: "chat-477b2.appspot.com",
    messagingSenderId: "581822989204"
  };
  firebase.initializeApp(config);

  $('.loginGoogle').removeClass('display-none');

  $('.loginGoogle').on('click', (event) => {
      event.preventDefault();
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;

        const client = new Client(user.displayName, user.photoURL);

        $('.loginGoogle').addClass('display-none');
        $('.chat-zone').show();

        $('.submit-btn').click(function()
        {
            client.sendMessage($('#message').val())
        })
        })
    });
})