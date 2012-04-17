$(function(){
         var keys = _.keys(QuanConfiguration.templates);
        _.each(keys, function(templateName){
            QuanConfiguration.templates[templateName.replace('templates/', '')] = QuanConfiguration.templates[templateName];
            delete QuanConfiguration.templates[templateName];
        });
});