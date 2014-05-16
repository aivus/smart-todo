<?php

namespace app\controllers;

use DateTime;
use yii\mongodb\Collection;
use yii\mongodb\Exception;
use yii\rest\Controller;
use Yii;

class ApiController extends Controller
{
    public function actionTasks($id = null)
    {
        $method = Yii::$app->request->getMethod();
        $post = Yii::$app->request->post();

        if (!$id) {
            switch($method) {
                case 'GET':
                    // Get all
                    /* @var $collection Collection */
                    $collection = Yii::$app->mongodb->getCollection('tasks');
                    return array(
                        'result'    =>  1,
                        'tasks'     =>  $collection->find()->sort(array('date' => 1)),
                    );

                case 'POST':
                    // Create new
                    $date = DateTime::createFromFormat('d.m.Y H:i', $post['date']);
                    /* @var $collection Collection */
                    $collection = Yii::$app->mongodb->getCollection('tasks');
                    try {
                        $collection->insert(array('text' => $post['text'], 'status' => $post['status'], 'date' => new \MongoDate($date->getTimestamp())));
                        Yii::$app->response->setStatusCode(201);
                        return array('result' => 1);
                    } catch (Exception $ex) {
                        Yii::$app->response->setStatusCode(403);
                        return array('result' => 0);
                    }

                case 'DELETE':
                    // Delete all
                    /* @var $collection Collection */
                    $collection = Yii::$app->mongodb->getCollection('tasks');
                    try {
                        $collection->drop();
                        return array('result' => 1);
                    } catch(Exception $ex) {
                        Yii::$app->response->setStatusCode(503);
                        return array('result' => 0);
                    }

                default:
                    Yii::$app->response->setStatusCode(405);
                    return array('result' => 0);
            }
        } else {
            switch($method) {
                case 'PUT':
                    // Replace task
                    /* @var $collection Collection */
                    $collection = Yii::$app->mongodb->getCollection('tasks');
                    $date = DateTime::createFromFormat('d.m.Y H:i', $post['date']);
                    try {
                        $updateResult = $collection->update(array('_id' => $id), array('text' => $post['text'], 'status' => $post['status'], 'date' => new \MongoDate($date->getTimestamp())));
                    } catch(Exception $ex) {
                        $updateResult = false;
                    }

                    if ($updateResult) {
                        return array('result' => 1);
                    } else {
                        Yii::$app->response->setStatusCode(410);
                        return array('result' => 0);
                    }

                case 'DELETE':
                    // Delete task
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
    }
} 