<?php

namespace app\controllers;

use DateTime;
use yii\base\ErrorException;
use yii\helpers\Html;
use yii\mongodb\Collection;
use yii\mongodb\Exception;
use yii\rest\Controller;
use Yii;

class ApiController extends Controller
{
    public function actionGetAllTasks()
    {
        /* @var $collection Collection */
        $collection = Yii::$app->mongodb->getCollection('tasks');
        $tasks = $collection->find()->sort(array('lastModified' => -1));

        $ifNoneMatch = Yii::$app->request->getHeaders()->get('If-None-Match');

        if ($tasks->hasNext()){
            $tasks->next();
            $current = $tasks->current();

            // Calculate Etag
            $etag = md5($current['lastModified'] . Yii::$app->params['etag_secret'] . $tasks->count());

            // Send Etag header
            Yii::$app->response->headers->add('ETag', $etag);

            // Check If-None-Match header
            if ($ifNoneMatch && $ifNoneMatch == $etag) {
                Yii::$app->response->setStatusCode(304);
                return;
            }

            return array(
                'result'    =>  1,
                'tasks'     =>  $tasks,
            );
        } else {
            return array(
                'result'    =>  0,
            );
        }
    }

    public function actionCreateTask()
    {
        $post = Yii::$app->request->post();

        $text = Html::encode($post['text']);
        $status = $post['status'] == 'true';
        $date = DateTime::createFromFormat('d.m.Y H:i', $post['date']);
        /* @var $collection Collection */
        $collection = Yii::$app->mongodb->getCollection('tasks');

        if (!$date) {
            Yii::$app->response->setStatusCode(400);
            return array('result' => 0);
        }

        try {
            $collection->insert(array('text' => $text, 'status' => $status, 'date' => new \MongoDate($date->getTimestamp()), 'lastModified' => time()));
            Yii::$app->response->setStatusCode(201);
            return array('result' => 1);
        } catch (Exception $ex) {
            Yii::$app->response->setStatusCode(403);
            return array('result' => 0);
        } catch (ErrorException $ex) {
            Yii::$app->response->setStatusCode(500);
            return array('result' => 0);
        }
    }

    public function actionDeleteAllTasks()
    {
        /* @var $collection Collection */
        $collection = Yii::$app->mongodb->getCollection('tasks');

        // Check for already dropped
        if ($collection->find()->limit(1)->count() === 0) {
            return array('result' => 1);
        }

        try {
            $collection->drop();
            return array('result' => 1);
        } catch(Exception $ex) {
            Yii::$app->response->setStatusCode(503);
            return array('result' => 0);
        }
    }

    public function actionGetOneTask($id)
    {
        /* @var $collection Collection */
        $collection = Yii::$app->mongodb->getCollection('tasks');
        $tasksCursor = $collection->find(array('_id' => new \MongoId($id)))->limit(1);
        if ($tasksCursor->count() > 0) {
            return array(
                'result' => 1,
                'task'   => $tasksCursor
            );
        } else {
            Yii::$app->response->setStatusCode(404);
            return array(
                'result' => 0
            );
        }
    }

    public function actionPutOneTask($id)
    {
        $post = Yii::$app->request->post();

        /* @var $collection Collection */
        $collection = Yii::$app->mongodb->getCollection('tasks');
        $text = Html::encode($post['text']);
        $status = $post['status'] == 'true';
        $date = DateTime::createFromFormat('d.m.Y H:i', $post['date']);

        if (!$date) {
            Yii::$app->response->setStatusCode(400);
            return array('result' => 0);
        }

        if (array_key_exists('lastModified', $post) && !array_key_exists('force', $post)) {
            $task = $collection->find(array('$and' => array(array('_id' => new \MongoId($id)), array('lastModified' => (int)$post['lastModified']))))->limit(1);
            if ($task->count() === 0) {
                Yii::$app->response->setStatusCode(409);
                return;
            }
        }

        try {
            $updateResult = $collection->update(array('_id' => $id), array('text' => $text, 'status' => $status, 'date' => new \MongoDate($date->getTimestamp()), 'lastModified' => time()));
        } catch(Exception $ex) {
            $updateResult = false;
        } catch (ErrorException $ex) {
            Yii::$app->response->setStatusCode(500);
            return array('result' => 0);
        }

        if ($updateResult) {
            return array('result' => 1);
        } else {
            Yii::$app->response->setStatusCode(410);
            return array('result' => 0);
        }
    }

    public function actionDeleteOneTask($id)
    {
        /* @var $collection Collection */
        $collection = Yii::$app->mongodb->getCollection('tasks');

        try {
            $collection->remove(array('_id' => $id));
            return array('result' => 1);
        } catch(Exception $ex) {
            Yii::$app->response->setStatusCode(503);
            return array('result' => 0);
        }
    }
}