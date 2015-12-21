module.exports = function getLoadingMessage() {
  var messages = [
    "enhancing"
  ]

 return "Please wait... " + messages[Math.floor(Math.random() * messages.length)];
}
