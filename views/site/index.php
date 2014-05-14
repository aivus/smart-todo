<?php
/**
 * @var yii\web\View $this
 */
$this->title = 'SMART TODO List';
?>
<div class="site-index">


    <div class="body-content">

        <!-- Create new task button -->
        <button type="button" class="btn btn-primary" id="createTask" data-toggle="modal" data-target="#editModal">Create new task</button>

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
                                <label for="dateTimeInput">Date</label>
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

    </div>
</div>
