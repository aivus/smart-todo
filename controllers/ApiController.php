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
                    $tasks = $collection->find()->sort(array('lastModified' => -1));

                    $ifNoneMatch = Yii::$app->request->getHeaders()->get('If-None-Match');

                    if ($tasks->hasNext()){
                        $tasks->next();
                        $current = $tasks->current();

                        // Calculate Etag
                        $etag = md5($current['lastModified'] . Yii::$app->params['etag_secret'] . $tasks->count());

                        // Send Etag header
                        Yii::$app->response->headers->add('Etag', $etag);

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


                case 'POST':
                    // Create new
                    $text = Html::encode($post['text']);
                    $status = $post['status'] == 'true';
                    $date = DateTime::createFromFormat('d.m.Y H:i', $post['date']);
                    /* @var $collection Collection */
                    $collection = Yii::$app->mongodb->getCollection('tasks');

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
                    $text = Html::encode($post['text']);
                    $status = $post['status'] == 'true';
                    $date = DateTime::createFromFormat('d.m.Y H:i', $post['date']);

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