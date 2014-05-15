$(document).ready(function(){

    $('#editModalDateTimePicker').datetimepicker({
        format: 'DD/MM/YYYY HH:mm',
        defaultDate: new moment()
    });

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
                return;
        }


        makeApiRequest(method, data, function() {
            updateTaskList();
            $('#editModal').modal('hide');
        }, function() {
            alert('Fail');
        });
    });

    $('#createTask').click(function(){
        var modal = $('#editModal');
        modal.find('#editModalLabel').html('New task');
        modal.find('#saveBtn').data('type', 'create');
    });

    $(document).on('click', '.task-complete', function(){
        var id = $(this).attr('id');
        makeApiRequest('DELETE', {id: id}, function(){
            $('#task-' + id).fadeOut();
        })
    });

    updateTaskList();

    // Fetch new task list from server
    function updateTaskList() {
        $.ajax({
            type: 'GET',
            url: "/api/tasks",
            dataType: "json"
        }).done(function(data) {
                if(data.result === 1) {
                    // Clean old data
                    $('#tasksArea').empty();

                    $.each(data.tasks, function(index, value) {
                        var date = new Date(value.date.sec * 1000);
                        var block = $('#taskRecordClone').clone();
                        var dbId = value._id.$id;

                        block.attr('id', 'task-' + dbId);

                        // Set id for complete button
                        block.find('.task-complete').attr('id', dbId);
                        block.find('.task-edit').attr('id', dbId);

                        var desc = block.find('#desc');
                        $(desc).html(value.text);
                        $('#tasksArea').append(block);

                        // Add readmore link
                        $(desc).readmore({
                            maxHeight: 40
                        });
                    });
                }
        });
    }

    function makeApiRequest(method, data, success, fail) {
        var id = data.id || '';
        delete data.id;

        $.ajax({
            type: method,
            url: "/api/tasks/" + id,
            data: data,
            dataType: "json"
        }).done(success).fail(fail);
    }


});