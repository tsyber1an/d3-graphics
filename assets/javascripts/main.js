var Main = {
    enableSectionHandlers: function(view){
        view.$('div.nav-content:eq(0) div.section>div').hide();
        view.$('div.nav-content:eq(0) div.section> h4').click(function () {
            $(this).toggleClass('selected').next().slideToggle(700);
        });

        view.$("#menu ul").hide();
        // Define which submenus should be visible when mouseover
        view.$("#menu li a").click(function () {
            view.$("#menu ul").slideToggle();
        });
    },

    render: function(view, model, options){
        window.model = model;
        options = options || {};
        var fetch = true;
        if (options.hasOwnProperty('fetch')) fetch = options.fetch;

        var empty = true;
        var footer = $('#footer').fadeOut({complete: function(){ if (empty) $(this).empty()}});
        var drawers = $('#drawers').fadeOut({complete: function(){ if (empty)$(this).empty()}});
        var main = $('#main');


        var showView = function(){
            footer.empty();
            drawers.empty();
            empty = false;

            view.render();

//            view.$('a').on('click', function(e){
//                var clickEl = $(e.currentTarget);
//                e.preventDefault();
//                Backbone.history.navigate(clickEl.attr('href'), {trigger: true});
//            });
            view.$("select, input:checkbox, input:radio, input:file").uniform();
            view.$('.date-picker').datePicker();
            if (fetch) Backbone.history.navigate(model.url().replace('.json', ''), {trigger: false});
            Main.enableSectionHandlers(view);
            main.fadeIn();
            footer.fadeIn();
            drawers.fadeIn();
        };

        if (fetch) model.fetch({success: showView});

        main.fadeOut({complete: function(){
            main.empty().append(view.el);

            if (!fetch) showView();
        }});
    }
};