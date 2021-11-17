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

