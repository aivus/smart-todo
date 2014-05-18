$(document).ready(function(){

    // Value of Etag header for GET requests
    var etag;

    $('#editModalDateTimePicker').datetimepicker({
        format: 'DD.MM.YYYY HH:mm'
    });

    $('#synchronizedLabel').find('.close').click(function(){
        $('#synchronizedLabel').fadeOut();
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
                var lastModified = $(saveBtn).data('lastModified');
                data.lastModified = lastModified;
                break;
            default:
                if (window.console && console.log) {
                    console.error('Unknown type: ' + type);
                }
                return;
        }

        makeApiRequest(method, data, function() {
            // Success
            updateTaskList();
        }, function(jqXHR, textStatus, errorThrown) {
            // Fail
            if (jqXHR == 400) {
                alert('You sent invalid data. Try again ;)');
            } else {
                apiFallback(method, data);
            }
        }, function () {
            // Always
            $('#editModal').modal('hide');
        });
    });

    $('#createTask').click(function(){
        var modal = $('#editModal');
        var date = (new moment()).format('DD.MM.YYYY HH:mm');
        $(modal).find('#editModalLabel').html('New task');
        $(modal).find('#saveBtn').data('type', 'create');

        // Fill fields
        $(modal).find('#saveBtn').removeData('dbId');
        $(modal).find('#taskText').val('');
        $(modal).find('#taskDateTime').val(date);
        $(modal).find('#taskStatus').prop('checked', false);

        // Set DateTimePicker
        var picker = $('#editModalDateTimePicker').data("DateTimePicker");
        picker.setDate(date);

        $(modal).modal('show');
    });

    $('#dropTasks').click(function(){
        var method = 'DELETE';
        var data = null;
        makeApiRequest(method, data, null, function(){
            // Fail
            apiFallback(method, data)
        }, function(){
            // Always
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

        var taskText = $(block).find('#desc').text();
        var taskDate = $(block).find('#date').html();
        var taskStatus = $(block).data('status');
        var lastModified = $(block).find('#modified').data('lastModified');

        // Fill form
        $(modal).find('#editModalLabel').html('Edit task');
        $(modal).find('#saveBtn').data('type', 'edit');
        $(modal).find('#saveBtn').data('lastModified', lastModified);
        $(modal).find('#saveBtn').data('dbId', id);
        $(modal).find('#taskText').val(taskText);
        $(modal).find('#taskDateTime').val(taskDate);
        $(modal).find('#taskStatus').prop('checked', (taskStatus == 'true' || taskStatus == true));

        // Set DateTimePicker
        var picker = $('#editModalDateTimePicker').data("DateTimePicker");
        picker.setDate(taskDate);

        $(modal).modal('show');
    });

    $(document).on('click', '.task-drop', function(){
        var id = $(this).attr('id');
        var method = 'DELETE';
        var data = {id: id};
        makeApiRequest(method, data, null, function(){
            // Fail
            apiFallback(method, data);
        }, function(){
            // Always
            var task = $('#task-' + id);
            $(task).fadeOut({
                done: function(){
                    $(task).remove();
                }
            });
        });
    });

    /* Conflict modal */
    $(document).on('click', '.mine', function(){
        var tmpNs = $.initNamespaceStorage('smart-todo-conflicts')
        var index = $(this).data('id');
        var request = tmpNs.localStorage.get(index);
        request.data.force = 1; // Force update
        makeApiRequest(request.method, request.data, function(){
            tmpNs.localStorage.remove(index);
            updateTaskList();
        });
        $('#conflict-' + index).modal('hide');
    });

    $(document).on('click', '.their', function(){
        var tmpNs = $.initNamespaceStorage('smart-todo-conflicts')
        var index = $(this).data('id');
        tmpNs.localStorage.remove(index);
        $('#conflict-' + index).modal('hide');
        updateTaskList();
    });

    setInterval(updateTaskList, 5000);
    updateTaskList();

    // Fetch new task list from server
    function updateTaskList() {

        // Set If-None-Match header
        var headers = {};
        if (etag) {
            headers = {"If-None-Match":  etag};
        }

        makeApiRequest('GET', null, function(data, textStatus, jqXHR) {

                // Check synchronize needed
                checkSynchronize();

                // Not modified. Skip...
                if (jqXHR.status == 304) {
                    return;
                }

                // Save Etag
                etag = jqXHR.getResponseHeader('ETag');

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
                        var lastModified = value.lastModified;

                        var block = $('#taskRecordClone').clone();
                        var dbId = value._id.$id;


                        $(block).attr('id', 'task-' + dbId);

                        // Fill record
                        block = fillRecord(block, text, date, status, lastModified);

                        // Set id for complete button
                        $(block).find('.task-drop').attr('id', dbId);
                        $(block).find('.task-edit').attr('id', dbId);

                        $('#tasksArea').append(block);


                        // Add readmore link
                        $(desc).readmore({
                            maxHeight: 50
                        });
                    });
                }
        }, null, null, headers);
    }

    function fillRecord(block, text, date, status, lastModified) {

        // Change panel background for completed tasks
        if (status == true) {
            $(block).removeClass('panel-default');
            $(block).addClass('panel-success');
        }

        // Save status into block data attribute
        $(block).data('status', status);

        $(block).find('#date').html(date.format('dd.mm.yyyy HH:MM', 'GMT'));
        var lastModifiedDate = new Date(lastModified * 1000);
        $(block).find('#modified').data('lastModified', lastModified);
        $(block).find('#modified').html(lastModifiedDate.format('dd.mm.yyyy HH:MM'));

        var desc = $(block).find('#desc');
        $(desc).html(text);

        return block;
    }

    // API fallback
    function apiFallback(method, data) {
        // Show warning
        $('#lostConnectionLabel').fadeIn('slow');
        $('#synchronizedLabel').fadeOut();

        var ns = $.initNamespaceStorage('smart-todo');
        var id = Math.random().toString().substr(2);
        var lastModified = parseInt((new Date()).getTime() / 1000);  // Replace lastModified on current time
        ns.localStorage.set(id, {method: method, data: data});

        var block;

        // New offline records can't be modified
        if (!data.id) {
            block = $('#taskRecordClone').clone();
            $(block).attr('id', 'task-' + id);

            // Remove drop/edit buttons
            $(block).find('.task-drop').remove();
            $(block).find('.task-edit').remove();
        } else {
            block = $('#task-' + data.id);
        }

        var momentDate = moment.utc(data.date, 'DD.MM.YYYY HH:mm');
        var date = new Date(momentDate);

        // Encode html chars
        var text = $('<div/>').text(data.text).html();
        fillRecord(block, text, date, data.status, lastModified);

        // Append new record
        if (!data.id) {
            $('#tasksArea').append(block);
        }
    }

    function checkSynchronize() {
        var ns = $.initNamespaceStorage('smart-todo');
        $.each(ns.localStorage.get(), function(index, value){
            makeApiRequest(value.method, value.data, function() {
                // Success
                ns.localStorage.remove(index);
                if (ns.localStorage.keys().length == 0) {
                    updateTaskList();
                }
            }, function(jqXHR, textStatus, errorThrown) {
                // Conflict
                if (jqXHR.status == 409) {
                    // Get info
                    makeApiRequest('GET', {id: value.data.id}, function(data){
                        var tmpNs = $.initNamespaceStorage('smart-todo-conflicts')
                        tmpNs.localStorage.set(index, ns.localStorage.get(index));
                        ns.localStorage.remove(index);

                        var modal = $('#conflictModal').clone();
                        $(modal).attr('id', 'conflict-' + index);
                        $(modal).find('.their').data('id', index);
                        $(modal).find('.mine').data('id', index);

                        // Their
                        // Date
                        var theirDate = new Date(data.task[value.data.id].date.sec * 1000);
                        $(modal).find('#theirText').html(data.task[value.data.id].text);
                        $(modal).find('#theirDate').html(theirDate.format('dd.mm.yyyy HH:MM', 'GMT'));

                        // Mine
                        var mineDate = new Date(moment.utc(value.data.date, 'DD.MM.YYYY HH:mm'));
                        $(modal).find('#mineText').html(value.data.text);
                        $(modal).find('#mineDate').html(mineDate.format('dd.mm.yyyy HH:MM', 'GMT'));

                        $(modal).modal('show');
                    }, function(jqXHR){
                        //Fail
                        if (jqXHR.status == 404) {
                            ns.localStorage.remove(index);
                        }
                    });
                } else if (jqXHR.status == 400) {
                    ns.localStorage.remove(index);
                    alert('You sent invalid data. Try again ;)');
                }
            }, function() {
                // Always
                $('#synchronizedLabel').fadeIn();
                $('#lostConnectionLabel').fadeOut();
            });
        });
    }

    function makeApiRequest(method, data, success, fail, always, headers) {
        // Check input parameters
        data = data || {};
        var workData = jQuery.extend(true, {}, data);   // Clone
        success = success || function(){};
        fail = fail || function(){};
        always = always || function(){};
        headers = headers || {};
        var id = workData.id || '';
        delete workData.id;

        $.ajax({
            type: method,
            url: "/api/tasks/" + id,
            data: workData,
            dataType: "json",
            headers: headers
        }).done(success).fail(fail).always(always);
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