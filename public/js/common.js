function validateField( form, name ) {
    var field = $(form).find('input[name=' + name + ']');
    field.parents('.form-group')[field.val() == '' ? 'addClass' : 'removeClass']('has-error');
    return !!field.val();
}

$(function(){
    $('body').on('click', 'div.event-group button.btn-danger', function() {
        $(this).parents('div.event-group').remove();
    });

    $('#add-event').click(function(){
        $(this).parents('.form-group').before(
            '<div class="form-group event-group">' +
                '<div class="col-sm-1"></div>' +
                '<div class="col-sm-6">' +
                    '<input type="text" class="form-control right-align" placeholder="Событие">' +
                '</div>' +
                '<div class="col-sm-3">' +
                    '<input type="text" class="form-control" placeholder="ДД.ММ(.ГГГГ)">' +
                '</div>' +
                '<div class="col-sm-2">' +
                    '<button type="button" class="btn btn-danger" title="Удалить событие">' +
                        '<i class="fa fa-minus-circle"></i>' +
                    '</button>' +
                '</div>' +
            '</div>'
        );
    });

    /* persons form */

    function isPersonValid(form) {
        var f1 = validateField(form, 'lastname'),
            f2 = validateField(form, 'firstname');
        return f1 && f2;
    }

    $("#person-form").submit(function(e) {
        e.preventDefault();
        var i = 0;
        $('.event-group').each(function() {
            $(this).find('.col-sm-6 input').attr('name', 'eventname' + i);
            $(this).find('.col-sm-3 input').attr('name', 'eventvalue' + i);
            i++;
        });
        if ( isPersonValid(this) ) {
            this.submit();
        }
        return false;
    });

    $('body').on('click', '#remove-person', function() {
        $('#modal-remove-person').modal();
    });

    $('body').on('click', '#real-remove-person', function() {
        location.href = '/remove-person?id=' + location.href.replace(/^.+\?id=(\d+)$/, '$1');
    });

    /* upload form */

    $("#upload-form").submit(function(e) {
        e.preventDefault();
        if ( validateField(this, 'persons') ) {
            this.submit();
        }
        return false;
    });

});