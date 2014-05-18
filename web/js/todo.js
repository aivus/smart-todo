$(document).ready(function(){

    // Value of Last-Modified header for GET requests
    var lastModified;

    $('#editModalDateTimePicker').datetimepicker({
        format: 'DD.MM.YYYY HH:mm',
        defaultDate: new moment()
    });

    $('#saveBtn').click(function(){
        var saveBtn = $('#saveBtn');
        var type = $(saveBtn).data('type');

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
                var dbId = $(saveBtn).data('dbId');
                data.id = dbId;
                break;
            default:
                if (window.console && console.log) {
                    console.error('Unknown type: ' + type);
                }
                return;
        }


        makeApiRequest(method, data, function() {
            updateTaskList();
            $('#editModal').modal('hide');
        }, function(jqXHR, textStatus, errorThrown) {
            var ns = $.initNamespaceStorage('smart-todo');
            $('#lostConnectionLabel').fadeIn('slow');
            $('#editModal').modal('hide');
        });
    });

    $('#createTask').click(function(){
        var modal = $('#editModal');
        $(modal).find('#editModalLabel').html('New task');
        $(modal).find('#saveBtn').data('type', 'create');

        // Empty fields
        $(modal).find('#saveBtn').removeData('dbId');
        $(modal).find('#taskText').val('');
        $(modal).find('#taskDateTime').val((new moment()).format('DD.MM.YYYY HH:mm'));
        $(modal).find('#taskStatus').prop('checked', false);

        $(modal).modal('show');
    });

    $('#dropTasks').click(function(){
        makeApiRequest('DELETE', null, function(){
            var taskArea = $('#tasksArea');
            $(taskArea).fadeOut({
                done: function(){
                    $(taskArea).empty();
                    $(taskArea).show();
                }
            });
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
        $(modal).find('#taskText').html(taskText);
        $(modal).find('#taskDateTime').val(taskDate);
        $(modal).find('#taskStatus').prop('checked', (taskStatus == 'true' || taskStatus == true));

        $(modal).modal('show');
    });

    $(document).on('click', '.task-drop', function(){
        var id = $(this).attr('id');
        makeApiRequest('DELETE', {id: id}, function(){
            var task = $('#task-' + id);

            $(task).fadeOut({
                done: function(){
                    $(task).remove();
                }
            });

        });
    });

    setInterval(updateTaskList, 5000);
    updateTaskList();

    // Fetch new task list from server
    function updateTaskList() {

        // Set If-Modified-Since header
        var headers = {};
        if (lastModified) {
            headers = {"If-Modified-Since":  lastModified};
        }

        makeApiRequest('GET', null, function(data, textStatus, jqXHR) {

                // Not modified. Skip...
                if (jqXHR.status == 304) {
                    return;
                }

                // Clean old data
                $('#tasksArea').empty();

                if(data.result === 1) {
                    // Sort by date
                    var tasksArray = sortObject(data.tasks, function (a, b) {
                        return a.value.date.sec - b.value.date.sec;
                    });

                    $.each(tasksArray, function(index, value) {
                        value = value.value;

                        var date = new Date(value.date.sec * 1000);
                        var text = value.text;
                        var status = value.status;
                        var localLastModified = value.lastModified;

                        var block = $('#taskRecordClone').clone();
                        var dbId = value._id.$id;

                        $(block).attr('id', 'task-' + dbId);

                        // Change panel background for completed tasks
                        if (value.status == true) {
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

                        // Save lastModified
                        if (!lastModified || localLastModified > lastModified){
                            lastModified = localLastModified;
                        }

                        // Add readmore link
                        $(desc).readmore({
                            maxHeight: 50
                        });
                    });
                } else {
                    lastModified = null;
                }
        }, null, headers);
    }

    function makeApiRequest(method, data, success, fail, headers) {
        // Check input parameters
        data = data || {};
        success = success || function(){};
        fail = fail || function(){};
        headers = headers || {};
        var id = data.id || '';
        delete data.id;

        $.ajax({
            type: method,
            url: "/api/tasks/" + id,
            data: data,
            dataType: "json",
            headers: headers
        }).done(success).fail(fail);
    }

    function sortObject(obj, sortFunc) {
        var arr = [];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                arr.push({
                    'key': prop,
                    'value': obj[prop]
                });
            }
        }
        arr.sort(sortFunc);
        return arr; // returns array
    }
});