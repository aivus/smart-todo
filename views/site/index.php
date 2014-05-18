<?php
/**
 * @var yii\web\View $this
 */
$this->title = 'SMART TODO List';
?>
<div class="site-index">


    <div class="body-content">
        <div id="lostConnectionLabel" class="alert alert-danger" style="display:none;"><strong>Connection lost.</strong> Sorry, but we lose connection to the server. Don't worry, <strong>all your changes are saved</strong>. After reconnection, your changes will be synchronized</div>
        <div id="synchronizedLabel" class="alert alert-success alert-dismissable" style="display:none;"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Connection resumed.</strong> All your changes <strong>synchronized</strong></div>
        <!-- Create new task button -->
        <button type="button" class="btn btn-primary" id="createTask">Create new task</button>
        <button type="button" class="btn btn-danger" id="dropTasks">REMOVE ALL TASKS</button>

        <h1>Your todo tasks:</h1>

        <div id="tasksArea" class="nav nav-list panel-group">
        </div>

        <!-- Modal -->
        <div class="modal fade" id="editModal" tabindex="-1" role="dialog" aria-labelledby="editModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title" id="editModalLabel">Modal title</h4>
                    </div>
                    <div class="modal-body">
                        <form role="form">
                            <div class="form-group">
                                <label for="taskText">Task text</label>
                                <textarea id="taskText" class="form-control" rows="10"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="taskDateTime">Due date</label>
                                <div class='input-group date' id='editModalDateTimePicker'>
                                    <input type='text' id="taskDateTime" class="form-control" />
                                    <span class="input-group-addon">
                                        <span class="fa fa-calendar"></span>
                                    </span>
                                </div>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="taskStatus"> Done?
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-success" id="saveBtn">Save changes</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Element for clone -->
        <div class="hide">
            <div class="panel panel-default" id="taskRecordClone">
                <div class="panel-heading">
                        <div class="panel-body">
                            <div><strong>Due date:</strong> <span id="date"></span></div>
                            <pre id="desc" style="word-wrap:break-word;"></pre>
                            <div class="text-right">
                                <button type="button" class="task-edit btn btn-warning">Edit</button>
                                <button type="button" class="task-drop btn btn-danger">Drop</button>
                            </div>
                        </div>
                </div>
            </div>
        </div>

    </div>
</div>
