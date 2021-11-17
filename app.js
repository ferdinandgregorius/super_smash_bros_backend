import fs from 'fs';
import https from 'https';
import bodyParser from "body-parser";
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {Dao} from './dao'

import {
    ERROR_DUPLICATE_ENTRY,
    ERROR_FOREIGN_KEY,
    WRONG_BODY_FORMAT,
    SOMETHING_WENT_WRONG,
    NO_SUCH_CONTENT,
    MISMATCH_OBJ_TYPE,
    MAIN_ACCOUNT_EXISTS,
    NO_MAIN_AACOUNT,
    TRANSACTION_NOT_PENDING,
    SUCCESS,
    ROLE_HAS_NO_ACCESS
} from "./strings";

import {
    User,
    Admin,
    Character,
    Item,
    Stages,
    Modes,
    Event_matches
} from "./model"

dotenv.config()

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json())

app.use(cors())
app.use((err, req, res, next)=>{
    if (err){
        if (err.type === 'entity.parse.failed') {
            res.status(406).send({
                success: false,
                error: 'WRONG-JSON-FORMAT'
            })
        }else{
            res.status(400).send({
                success: false,
                error: 'CHECK-SERVER-LOG'
            })
            console.error(err)
        }
    }
});

const PORT = process.env.DATABASE_PORT
const host = process.env.MY_SQL_HOST
const user = process.env.MY_SQL_USER
const password = typeof process.env.MY_SQL_PASSWORD === 'undefined' ? '' : process.env.MY_SQL_PASSWORD
const dbname = process.env.MY_SQL_DBNAME
const dao = new Dao(host, user, password, dbname)

app.listen(PORT, ()=>{
    console.info(`Server serving port ${PORT}`)
})

const server = https.createServer(app)
server.listen(PORT)