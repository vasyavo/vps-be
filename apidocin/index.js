
/**
* @api {post} /users/login Request User Authorization
* @apiName LoginUser
* @apiGroup Authentication
*
* @apiParam {string} userName User unique name.
* @apiParam {string} password User password
*
* @apiSuccess {int} status - HTTP response status
* @apiSuccess {object} error - Error object with code and message
* @apiSuccess {int} error.code - Error code
* @apiSuccess {message} error.message - Error message
* @apiSuccess {object} data - Success response data
* @apiSuccess {object} data.content - User object
* @apiSuccess {object} data.message - Success message
*
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*          "status": 200,
*          "error": null,
*          "data": {
*              "content": {
*                  "user": {
*                      "__v": 0,
*                      "time_register": "time",
*                      "password": "password",
*                      "status": "confirmed",
*                      "login": "login",
*                      "_id": "56ca33346c39fda2896e5cbf",
*                      "supression": [],
*                      "token": ['auth token here']
*                  }
*              },
*              "message": "Authenticate success."
*          }
*     }
*/


/**
* @api {get} /users/logout Request User Logout
* @apiName LogoutUser
* @apiGroup Authentication
*
* @apiHeader {String} x-access-token Users unique access-token.
*
* @apiSuccess {int} status - HTTP response status
* @apiSuccess {object} error - Error object with code and message
* @apiSuccess {int} error.code - Error code
* @apiSuccess {message} error.message - Error message
* @apiSuccess {object} data - Success response data
* @apiSuccess {object} data.content - User object
* @apiSuccess {object} data.message - Success message
*
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*          "status": 200,
*          "error": null,
*          "data": {
*              "content": {
*                  "user": {
*                      "__v": 0,
*                      "time_register": "time",
*                      "password": "password",
*                      "status": "confirmed",
*                      "login": "login",
*                      "_id": "56ca33346c39fda2896e5cbf",
*                      "supression": [],
*                      "token": ['removed from here current session access token']
*                  }
*              },
*              "message": "Logout success."
*          }
*     }
*/


/**
* @api {put} /admin/users Request Create new user
* @apiName CreateUser
* @apiGroup Users
*
* @apiHeader {String} x-access-token User unique access-token.
* @apiPermission admin
*
* @apiParam {Object} user - object with user data
* @apiParamExample {json} Request-Example:
*    {
*        "user_name": "some_name",
*        "password": "some_password",
*        "first_name": "some_first_name",
*        "las_name": "some_last_name",
*        "company_representing": "some_company_representing",
*        "comment": "some_comment",
*        "role": "participant",
*    }
*
* @apiSuccess {int} status - HTTP response status
* @apiSuccess {object} error - Error object with code and message
* @apiSuccess {int} error.code - Error code
* @apiSuccess {message} error.message - Error message
* @apiSuccess {object} data - Success response data
* @apiSuccess {object} data.content - Created user object
* @apiSuccess {object} data.message - Success message
*
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*        "status": 200,
*        "error": null,
*        "data": {
*            "content": {
*                "user": {
*                     "__v": 0,
*                "status": "active",
*                "user_name": "testName",
*                "first_name": "Name",
*                "last_name": "LastName",
*                "company_representing": "Company",
*                "comment": "Comment",
*                "_id": "574d898fa4775ab69718b2d2",
*                "roles": [
*                    "participant"
*                ],
*                "notifications": [],
*                "token": []
*                }
*            },
*            "message": "Well done. You successfully created a user."
*        }
*     }
*/


/**
* @api {patch} /admin/users/:id Request Update user by id
* @apiName UpdateUser
* @apiGroup Users
*
* @apiHeader {String} x-access-token User unique access-token.
* @apiPermission admin
*
* @apiParam {Object} user - object with user data
* @apiParamExample {json} Request-Example:
*    {
*        "user_name": "some_name",
*        "password": "some_password",
*        "first_name": "some_first_name",
*        "las_name": "some_last_name",
*        "company_representing": "some_company_representing",
*        "comment": "some_comment",
*        "role": "participant",
*    }
*
* @apiSuccess {int} status - HTTP response status
* @apiSuccess {object} error - Error object with code and message
* @apiSuccess {int} error.code - Error code
* @apiSuccess {message} error.message - Error message
* @apiSuccess {object} data - Success response data
* @apiSuccess {object} data.content - Updated user object
* @apiSuccess {object} data.message - Success message
*
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*        "status": 200,
*        "error": null,
*        "data": {
*            "content": {
*                "user": {
*                     "__v": 0,
*                "status": "active",
*                "user_name": "testName",
*                "first_name": "Name",
*                "last_name": "LastName",
*                "company_representing": "Company",
*                "comment": "Comment",
*                "_id": "574d898fa4775ab69718b2d2",
*                "roles": [
*                    "participant"
*                ],
*                "notifications": [],
*                "token": []
*                }
*            },
*            "message": "Well done. You successfully update a user."
*        }
*     }
*/

/**
* @api {delete} /admin/users/:id Request Delete user by id
* @apiName DeleteUser
* @apiGroup Users
*
* @apiHeader {String} x-access-token User unique access-token.
* @apiPermission admin
*
*
* @apiSuccess {int} status - HTTP response status
* @apiSuccess {object} error - Error object with code and message
* @apiSuccess {int} error.code - Error code
* @apiSuccess {message} error.message - Error message
* @apiSuccess {object} data - Success response data
* @apiSuccess {object} data.content - Updated user object
* @apiSuccess {object} data.message - Success message
*
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*        "status": 200,
*        "error": null,
*        "data": {
*            "content": {
*            },
*            "message": "Well done. You successfully delete a user."
*        }
*     }
*/

/**
* @api {put} /admin/users/duplicate/:id Request Duplicate user by id
* @apiName DuplicateUser
* @apiGroup Users
*
* @apiHeader {String} x-access-token User unique access-token.
* @apiPermission admin
*
*
* @apiSuccess {int} status - HTTP response status
* @apiSuccess {object} error - Error object with code and message
* @apiSuccess {int} error.code - Error code
* @apiSuccess {message} error.message - Error message
* @apiSuccess {object} data - Success response data
* @apiSuccess {object} data.content - Duplicated user object
* @apiSuccess {object} data.message - Success message
*
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*        "status": 200,
*        "error": null,
*        "data": {
*            "content": {
*                "user": {
*                     "__v": 0,
*                "status": "active",
*                "user_name": "testName",
*                "first_name": "Name",
*                "last_name": "LastName",
*                "company_representing": "Company",
*                "comment": "Comment",
*                "_id": "574d898fa4775ab69718b2d2",
*                "roles": [
*                    "participant"
*                ],
*                "notifications": [],
*                "token": []
*                }
*            },
*            "message": "Well done. You successfully duplicate a user."
*        }
*     }
*/

/**
* @api {get} /admin/users/:id Request Get user by id
* @apiName GetUser
* @apiGroup Users
*
* @apiHeader {String} x-access-token User unique access-token.
* @apiPermission admin
*
*
* @apiSuccess {int} status - HTTP response status
* @apiSuccess {object} error - Error object with code and message
* @apiSuccess {int} error.code - Error code
* @apiSuccess {message} error.message - Error message
* @apiSuccess {object} data - Success response data
* @apiSuccess {object} data.content - Updated user object
* @apiSuccess {object} data.message - Success message
*
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*        "status": 200,
*        "error": null,
*        "data": {
*            "content": {
*                "user": {
*                     "__v": 0,
*                "status": "active",
*                "user_name": "testName",
*                "first_name": "Name",
*                "last_name": "LastName",
*                "company_representing": "Company",
*                "comment": "Comment",
*                "_id": "574d898fa4775ab69718b2d2",
*                "roles": [
*                    "participant"
*                ],
*                "notifications": [],
*                "token": []
*                }
*            },
*            "message": ""
*        }
*     }
*/

/**
* @api {get} /admin/users Get Users list
* @apiName UsersList
* @apiGroup Users
*
* @apiHeader {String} x-access-token User unique access-token.
* @apiPermission admin
* @apiParam {string} limit Optional, limit number of leads, by default - 10
* @apiParam {string} skip Optional, number of skiped leads, by default - 0
* @apiParam {string} keyword Optional, keyword for searching, by default - all
* @apiParam {string} sort_field Optional, name of field by which we want sort, if - symbol before property - DESC sort, default - ASC
*
* @apiSuccess {int} status - HTTP response status
* @apiSuccess {object} error - Error object with code and message
* @apiSuccess {int} error.code - Error code
* @apiSuccess {message} error.message - Error message
* @apiSuccess {object} data - Success response data
* @apiSuccess {object} data.content - Array of users objects
* @apiSuccess {object} data.message - Success message
*
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*        "status": 200,
*        "error": null,
*        "data": {
*            "content": {
*               users: [...]
*            },
*            "message": ""
*        }
*     }
*/
