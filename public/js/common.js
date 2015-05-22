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
                        '<i class="fa fa-minus-circle fa-lg"></i>' +
                    '</button>' +
                '</div>' +
            '</div>'
        );
    });

    $("#person-form").submit(function(e) {
        e.preventDefault();
        var i = 0;
        $('.event-group').each(function() {
            $(this).find('.col-sm-6 input').attr('name', 'eventname' + i);
            $(this).find('.col-sm-3 input').attr('name', 'eventvalue' + i);
            i++;
        });
        this.submit();
        return false;
    });

    $('body').on('click', '#remove-person', function() {
        $('#modal-remove-person').modal();
    });

    $('body').on('click', '#real-remove-person', function() {
        location.href = '/remove-person?id=' + location.href.replace(/^.+\?id=(\d+)$/, '$1');
    });
});