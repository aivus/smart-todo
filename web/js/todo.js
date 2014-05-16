$(document).ready(function(){

    $('#editModalDateTimePicker').datetimepicker({
        format: 'DD.MM.YYYY HH:mm',
        defaultDate: new moment()
    });

    $('#saveBtn').click(function(){
        var type = $('#saveBtn').data('type');

        var method;

        var text = $('#taskText').val();
        var date = $('#taskDateTime').val();
        var status = $('#taskStatus').prop('checked');
        var data = {text: text, status: status, date: date};

        switch(type) {
            case 'create':
                method = 'POST';
                break;
            case 'edit':
                method = 'PUT';
                var dbId = $('#saveBtn').data('dbId');
                data.id = dbId;
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
        $(modal).find('#editModalLabel').html('New task');
        $(modal).find('#saveBtn').data('type', 'create');

        // Empty fields
        $(modal).find('#saveBtn').removeData('dbId');
        $(modal).find('#taskText').empty();
        $(modal).find('#taskDateTime').empty();
        $(modal).find('#taskStatus').prop('checked', false);

        $(modal).modal('show');
    });

    $('#dropTasks').click(function(){
        makeApiRequest('DELETE', null, function(){
            $('#tasksArea').fadeOut();
        });
    });

    /* Edit task */
    $(document).on('click', '.task-edit', function(){
        var id = $(this).attr('id');
        var modal = $('#editModal');
        var block = $('#task-' + id);

        var taskText = $(block).find('#desc').html();
        var taskDate = $(block).find('#date').html();
        var taskStatus = $(block).data('status');

        // Fill form
        $(modal).find('#editModalLabel').html('Edit task');
        $(modal).find('#saveBtn').data('type', 'edit');
        $(modal).find('#saveBtn').data('dbId', id);
        $(modal).find('#taskText').val(taskText);
        $(modal).find('#taskDateTime').val(taskDate);
        $(modal).find('#taskStatus').prop('checked', taskStatus === 'true');

        $(modal).modal('show');
    });

    $(document).on('click', '.task-drop', function(){
        var id = $(this).attr('id');
        makeApiRequest('DELETE', {id: id}, function(){
            $('#task-' + id).fadeOut();
        });
    });

    updateTaskList();

    // Fetch new task list from server
    function updateTaskList() {
        makeApiRequest('GET', null, function(data) {
                if(data.result === 1) {
                    // Clean old data
                    $('#tasksArea').empty();

                    $.each(data.tasks, function(index, value) {
                        var date = new Date(value.date.sec * 1000);
                        var text = value.text;
                        var status = value.status;

                        var block = $('#taskRecordClone').clone();
                        var dbId = value._id.$id;

                        $(block).attr('id', 'task-' + dbId);

                        // Change panel background for completed tasks
                        if (value.status == 'true') {
                            $(block).removeClass('panel-default');
                            $(block).addClass('panel-success');
                        }

                        // Save status into block data attribute
                        $(block).data('status', status);

                        $(block).find('#date').html(date.format('dd.mm.yyyy HH:MM', 'GMT'));

                        // Set id for complete button
                        $(block).find('.task-drop').attr('id', dbId);
                        $(block).find('.task-edit').attr('id', dbId);

                        var desc = $(block).find('#desc');
                        $(desc).html(text);
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
        // Check input parameters
        data = data || {};
        success = success || function(){};
        fail = fail || function(){};
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