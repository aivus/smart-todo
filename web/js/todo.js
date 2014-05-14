$(document).ready(function(){

    $('#editModalDateTimePicker').datetimepicker();

    $('#saveBtn').click(function(){
        var type = $('#saveBtn').data('type');
        var method;
        var data;

        switch(type) {
            case 'create':
                method = 'POST';
                var text = $('#taskText').val();
                var date = $('#taskDateTime').val();
                var status = $('#taskStatus').val();
                data = {text: text, status: status, date: date};
                break;
            default:
                console.error('Unknown type: ' + type);
        }

        $.ajax({
            type: method,
            url: "/api/tasks",
            data: data,
            dataType: "json"
        }).done(function() {
            $('#editModal').modal('hide');
        });
    });

    $('#createTask').click(function(){
        var modal = $('#editModal');
        modal.find('#editModalLabel').html('New task');
        modal.find('#saveBtn').data('type', 'create');
    });
});