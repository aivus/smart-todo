<?php

namespace app\controllers;

use yii\mongodb\Collection;
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
                    break;
                case 'POST':
                    // Create new
                    /* @var $collection Collection */
                    $collection = Yii::$app->mongodb->getCollection('tasks');
                    $collection->insert(['text' => $post['text'], 'status' => $post['status'], 'date' => new \MongoDate(strtotime($post['date']))]);
                    return array('result' => 1);
                    break;
            }
        } else {
            switch($method) {
                case 'GET':
                    // Get info
                    break;
                case 'PUT':
                    echo '123';
                    // Change
                    break;
                case 'DELETE':
                    // Delete
                    break;
            }
        }
    }
} 