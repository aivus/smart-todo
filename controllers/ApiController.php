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
                    $collection->insert(array('text' => $post['text'], 'status' => $post['status'], 'date' => new \MongoDate(strtotime($post['date']))));
                    return array('result' => 1);
                    break;
                default:
                    Yii::$app->response->setStatusCode(405);
                    return array(
                        'result' => 0,
                        'reason' => 'Unknown method'
                    );
            }
        } else {
            switch($method) {
                case 'GET':
                    // Get info
                    break;
                case 'PUT':
                    // Change
                    break;
                case 'DELETE':
                    /* @var $collection Collection */
                    $collection = Yii::$app->mongodb->getCollection('tasks');
                    $cursor = $collection->find(array('_id' => $id));

                    if ($cursor->count() === 1) {
                        $collection->remove(array('_id' => $id));
                        return array('result' => 1);
                    } else {
                        Yii::$app->response->setStatusCode(400);
                        return array(
                            'result' => 0,
                            'reason' => 'Record doesn\'t exist'
                        );
                    }
            }
        }
    }
} 