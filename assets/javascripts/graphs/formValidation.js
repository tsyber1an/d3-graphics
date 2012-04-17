var FormValidation = FormValidation || {};
FormValidation.onlyNonNegativeNumbers = function(){
  this.numeric({ negative: false }, function() { alert("No negative values"); this.value = ""; this.focus(); });
};
