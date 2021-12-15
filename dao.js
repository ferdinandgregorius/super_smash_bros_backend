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
    Event_matches, Articles
} from "./model"
import {reject} from "bcrypt/promises";
import {resolve} from "path";

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
                    this._host,
                    this._user,
                    this._password,
                    this._dbname
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

    retrieveUsers(){
        return new Promise((resolve,reject)=>{
            const query = "SELECT * FROM user "

            this.mysqlConn.query(query, (error,result)=>{
                if(error){
                    reject(error)
                    return
                }

                let users = []
                for(let i =0; i<result.length; i++){
                    users.push(new User(
                        result[i].user_id,
                        result[i].username,
                        result[i].password,
                        result[i].salt
                    ))
                }

                resolve(users)
            })
        })
    }

    retrieveOneUser(user){
        return new Promise((resolve,reject)=>{
            if(!user instanceof User){
                reject(MISMATCH_OBJ_TYPE)
                return
            }

            const query = "SELECT * FROM user WHERE username = ?"

            this.mysqlConn.query(query, user.username, (error,result)=>{
                if(error){
                    reject(error)
                    return
                }

                const user = result.map(rowDataPacket=>{
                    return{
                        user_id:rowDataPacket.user_id,
                        username:rowDataPacket.username,
                        password:rowDataPacket.password,
                        salt:rowDataPacket.salt
                    }
                })

                resolve(user)
            })
        })
    }

    retrieveCharacters(){
        return new Promise((resolve,reject)=>{
            const query = "SELECT * FROM characters "

            this.mysqlConn.query(query, (error,result)=>{
                if(error){
                    reject(error)
                    return
                }

                let characters = []
                for(let i =0; i<result.length; i++){
                    characters.push(new Character(
                        result[i].character_id,
                        result[i].name,
                        result[i].attributes,
                        result[i].description
                    ))
                }

                resolve(characters)
            })
        })
    }

    retrieveOneCharacter(character){
        return new Promise((resolve,reject)=>{

            if(!character instanceof Character){
                reject(MISMATCH_OBJ_TYPE)
                return
            }

            const query = "SELECT * FROM characters WHERE character_id = ? "

            this.mysqlConn.query(query, character.character_id, (error,result)=>{
                if(error){
                    reject(error)
                }else if(result.length<1){
                    error=NO_SUCH_CONTENT
                    reject(error)
                }else{
                    let characters = []
                    for(let i =0; i<result.length; i++){
                        characters.push(new Character(
                            result[i].character_id,
                            result[i].name,
                            result[i].attributes,
                            result[i].description,
                            result[i].character_picture
                        ))
                    }

                    resolve(characters)
                }
            })
        })
    }

    addCharacter(character){
        return new Promise((resolve,reject)=>{
            if(!character instanceof Character){
                reject(MISMATCH_OBJ_TYPE)
                return
            }

            const query = "INSERT INTO `characters`(`name`, `attributes`, `description`, `character_picture`) "+
                "VALUES(?, ?, ?, ?) "

            this.mysqlConn.query(query, [character.name, character.attributes, character.description, character.character_picture], (error,result)=>{
                if(error){
                    reject(error)
                    return
                }

                character.character_id=result.insertId
                resolve(character)
            })
        })
    }

    updateCharacter(character){
        return new Promise((resolve,reject)=>{
            if(!character instanceof  Character){
                reject(MISMATCH_OBJ_TYPE)
                return
            }

            const query = "UPDATE characters SET name = ?, attributes = ?, description = ?, character_picture = ? " +
                "WHERE character_id = ?"
            this.mysqlConn.query(query, [character.name, character.attributes,
                character.description, character.character_picture, character.character_id], (error,result)=>{

                if(error){
                    reject(error)
                    return
                }

                resolve(character)
            })
        })
    }

    deleteCharacter(character){
        return new Promise((resolve,reject)=>{
            if(!character instanceof  Character){
                reject(MISMATCH_OBJ_TYPE)
                return
            }

            const query = "DELETE FROM characters WHERE character_id = ?"
            this.mysqlConn.query(query, character.character_id, (error,result)=>{

                if(error){
                    reject(error)
                    return
                }

                resolve(SUCCESS)
            })
        })
    }

    retrieveArticles(){
        return new Promise((resolve, reject)=>{
            const query = "SELECT a.title, a.description, a.date_created, u.username " +
                "FROM articles a LEFT OUTER JOIN user u ON a.user_id = u.user_id "

            this.mysqlConn.query(query, (error,result)=>{
                if(error){
                    reject(error)
                    return
                }

                const articles = result.map(rowDataPacket=>{
                    return{
                        title:rowDataPacket.title,
                        description:rowDataPacket.description,
                        date_created:rowDataPacket.date_created,
                        author:rowDataPacket.username
                    }
                })

                resolve(articles)
            })
        })
    }

    retrieveArticlesByUser(user) {
        return new Promise((resolve,reject)=>{
            console.log(user)
            if(!user instanceof User){
                reject(MISMATCH_OBJ_TYPE)
                return
            }

            const query = "SELECT a.title, a.description, a.date_created, u.username " +
                "FROM articles a LEFT OUTER JOIN user u ON a.user_id = u.user_id " +
                "WHERE u.username=?"

            this.mysqlConn.query(query, user.username, (error,result)=>{
                if(error){
                    reject(error)
                    return
                }

                const articles = result.map(rowDataPacket=> {
                    return {
                        title:rowDataPacket.title,
                        description:rowDataPacket.description,
                        date_created:rowDataPacket.date_created,
                        author:rowDataPacket.username
                    }
                })

                resolve(articles)
            })
        })
    }

    retrieveArticleById(article){
        return new Promise((resolve,reject)=>{
            if(!article instanceof Articles){
                reject(MISMATCH_OBJ_TYPE)
                return
            }

            const query = "SELECT * FROM articles WHERE article_id=? "
            this.mysqlConn.query(query, article.article_id, (error,result)=>{
                if(error){
                    reject(error)
                    return
                }else if(result.length<1){
                    error=NO_SUCH_CONTENT
                    reject(error)
                }else{
                    const articles = result.map(rowDataPacket=> {
                        return {
                            title:rowDataPacket.title,
                            description:rowDataPacket.description,
                            date_created:rowDataPacket.date_created,
                            author:rowDataPacket.username
                        }
                    })

                    resolve(articles)
                }

            })
        })
    }

    retrieveOneArticle(article){
        return new Promise((resolve,reject)=>{
            if(!article instanceof Articles){
                reject(MISMATCH_OBJ_TYPE)
                return
            }

            const query = "SELECT a.article_id, a.title, a.body, a.description, a.date_created, u.username " +
                "FROM articles a LEFT OUTER JOIN user u ON a.user_id = u.user_id " +
                "WHERE a.title=? "

            this.mysqlConn.query(query, article.title, (error,result)=>{
                if(error){
                    reject(error)
                    return
                }

                const articles = result.map(rowDataPacket=>{
                    return{
                        article_id:rowDataPacket.article_id,
                        title:rowDataPacket.title,
                        body:rowDataPacket.body,
                        description:rowDataPacket.description,
                        date_created:rowDataPacket.date_created,
                        author:rowDataPacket.username
                    }
                })

                resolve(articles)
            })
        })
    }

    addArticle(article){
        return new Promise((resolve,reject)=>{
            if(!article instanceof Articles){
                reject(MISMATCH_OBJ_TYPE)
                return
            }

            const query = "INSERT INTO `articles`(`title`, `body`, `description`, `date_created`, `user_id`) " +
                "VALUES(?, ?, ?, NOW(), ?) "
            this.mysqlConn.query(query, [article.title, article.body, article.description, article.user_id], (error, result)=>{
                if(error){
                    reject(error)
                    return
                }

                article.article_id = result.insertId
                resolve(article)
            })
        })
    }

    updateArticle(article){
        return new Promise((resolve,reject)=>{
            if(!article instanceof Articles){
                reject(MISMATCH_OBJ_TYPE)
                return
            }

            const query = "UPDATE articles SET title = ?, body = ?, description = ? WHERE article_id = ? "
            this.mysqlConn.query(query, [article.title, article.body, article.description, article.article_id], (error,result)=>{
                if(error){
                    reject(error)
                    return
                }

                resolve(article)
            })
        })
    }

    deleteArticle(article){
        return new Promise((resolve,reject)=>{
            if(!article instanceof Articles){
                reject(MISMATCH_OBJ_TYPE)
                return
            }

            const query = "DELETE FROM articles WHERE article_id = ? "
            this.mysqlConn.query(query, article.article_id, (error,result)=>{
                if(error){
                    reject(error)
                    return
                }

                resolve(SUCCESS)
            })
        })
    }
}