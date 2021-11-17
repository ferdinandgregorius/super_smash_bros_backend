import mysqlConn from './mysql-conn'
import fs from 'fs'
import bcrypt from 'bcrypt'

import{
    NO_AFFECTED_ROWS, SOMETHING_WENT_WRONG, WRONG_BODY_FORMAT, ERROR_FOREIGN_KEY,
    NO_SUCH_CONTENT, MISMATCH_OBJ_TYPE, ERROR_DUPLICATE_ENTRY, MAIN_ACCOUNT_EXISTS,
    NO_MAIN_AACOUNT, TRANSACTION_NOT_PENDING, DATA_IS_DELETED, ROLE_HAS_NO_ACCESS,
    SUCCESS
} from "./strings"

import {
    User,
    Admin,
    Character,
    Item,
    Stages,
    Modes,
    Event_matches
} from "./model"

export class Dao{
    constructor(host, user, password, dbname) {
        this._host = host
        this._user = user
        this._password = password
        this._dbname = dbname

        this._initSqlStat = fs.readFileSync("super_smash_bros.sql").toString()

        const handleConnection=()=>{
            return new Promise(resolve => {
                this.mysqlConn = new mysqlConn(
                    this._host = host,
                    this._user = user,
                    this._password = password,
                    this._dbname = dbname
                )

                this.mysqlConn.connect(error=>{
                    if(error){
                        console.error('Error when connecting to database: ', error)
                        setTimeout(handleConnection, 2000)
                    }else {
                        this.mysqlConn.query(this._initSqlStat, (error, result, fields)=>{
                            if(error){
                                throw error
                            }else{
                                console.info("CONNECTION TO DATABASE SUCCESSFUL")
                                resolve(1)
                            }
                        })
                    }
                })

                this.mysqlConn.on('error', (error)=>{
                    console.log('database error', error)
                    if(error.code === 'PROTOCOL_CONNECTION_LOST'){
                        handleConnection()
                    }else{
                        console.error(error)
                        handleConnection()
                    }
                })
            })
        }

        handleConnection()
    }

    login(username, password){
        return new Promise(async (resolve, reject)=>{
            const query = "SELECT * FROM user u " + "WHERE u.username = ? "

            this.mysqlConn.query(query, username, (error,result)=>{
                if(error){
                    reject(error)
                    return
                }

                if(result.length > 0){
                    const salt = result[0].salt
                    const hashedPassword = bcrypt.hashSync(password,salt)
                    const bcryptedPassword = hashedPassword === result[0].password ? true : false

                    if(bcryptedPassword){
                        resolve(new User(result[0].user_id, result[0].username, result[0].password, result[0].salt))
                    }else {
                        reject("FALSE_AUTH")
                    }
                }else {
                    reject("FALSE_AUTH")
                }
            })
        })
    }

    register(user){
        return new Promise(async (resolve,reject)=>{
            if(!user instanceof User){
                reject(MISMATCH_OBJ_TYPE)
                return
            }

            const query = "INSERT INTO `user`(`username`, `password`, `salt`) "+
                "VALUES(?, ?, ?) "
            const salt = await bcrypt.genSalt(5)
            const hash = await bcrypt.hash(user.password, salt)

            this.mysqlConn.query(query,[user.username, hash, salt], (error,result)=>{
                if(error){
                    reject(error)
                    return
                }

                user.user_id = result.insertId
                resolve(user)
            })
        })
    }


}