import fs from 'fs';
//import https from 'https';
import  http from 'http';
import multer from 'multer';
import path from 'path';
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
    Event_matches, Articles
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
const UPLOADPATH = process.env.UPLOAD_PATH

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './Uploads/');
    },
    filename: function (req, file, cb){
        const originalFileName = file.originalname
        let fileExtension = originalFileName.split(".")
        fileExtension = fileExtension[fileExtension.length-1]
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

// const imageFileFilter = (req, file, cb)=>{
//     //Filter to only accept certain file types
//     if(!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|doc|docx|pdf|txt|xls|csv|xlsx)$/)){
//         req.fileValidationError = 'Please upload jpg, png, gif, doc, pdf, txt, xls, or csv file types.';
//         return cb(new Error('Please upload jpg, png, gif, doc, pdf, txt, xls, or csv file types.'), false);
//     }
//     cb(null, true);
// }

//const upload = multer({storage:storage, fileFilter: imageFileFilter})
const upload = multer({storage:storage})

app.post('/api/login',(req,res)=>{
    if(typeof req.body.username === 'undefined' || typeof req.body.password === 'undefined'){
        res.status(400).send({
            success:false,
            error:WRONG_BODY_FORMAT
        })
        return
    }

    dao.login(req.body.username, req.body.password).then(result=>{
        res.status(200).send({
            success: true,
            result: result,
            message: "Authentication Successful"
        })
    }).catch(error=>{
        if(error === "FALSE_AUTH"){
            res.status(400).send({
                success: false,
                auth: false,
                message: "Incorrect username or password"
            })
        }else{
            console.error(error)
            res.status(500).send({
                success: false,
                error: SOMETHING_WENT_WRONG
            })
        }
    })
})

app.post('/api/register',(req,res)=>{
    if(typeof req.body.username === 'undefined' || typeof req.body.password === 'undefined'){
        res.status(400).send({
            success: false,
            error: WRONG_BODY_FORMAT
        })
        return
    }

    dao.register(new User(null, req.body.username, req.body.password)).then(result=>{
        res.status(200).send({
            success: true,
            result: result
        })
    }).catch(error=>{
        console.error(error)
        res.status(500).send({
            success: false,
            error: SOMETHING_WENT_WRONG
        })
    })
})

app.get('/api/user/retrieve', (req,res)=>{
    if(typeof req.query.username === 'undefined'){
        dao.retrieveUsers().then(result=>{
            res.status(200).send({
                success:true,
                result: result
            })
        }).catch(error=>{
            console.error(error)
            res.status(500).send({
                success:false,
                error:SOMETHING_WENT_WRONG
            })
        })
    }else{
        dao.retrieveOneUser(new User(null, req.query.username)).then(result=>{
            res.status(200).send({
                success:true,
                result:result
            })
        }).catch(error=>{
            if(error === NO_SUCH_CONTENT){
                res.status(204).send({
                    success:false,
                    error:NO_SUCH_CONTENT
                })
                return
            }
            console.error(error)
            res.status(500).send({
                success:false,
                error:SOMETHING_WENT_WRONG
            })
        })
    }
})

app.get('/api/character/retrieve', (req,res)=>{
    if(typeof req.query.character_id === 'undefined'){
        dao.retrieveCharacters().then(result=>{
            res.status(200).send({
                success:true,
                result: result
            })
        }).catch(error=>{
            console.error(error)
            res.status(500).send({
                success:false,
                error:SOMETHING_WENT_WRONG
            })
        })
    }else{
        dao.retrieveOneCharacter(new Character(req.query.character_id)).then(result=>{
            res.status(200).send({
                success:true,
                result:result
            })
        }).catch(error=>{
            if(error === NO_SUCH_CONTENT){
                res.status(204).send({
                    success:false,
                    error:NO_SUCH_CONTENT
                })
                return
            }
            console.error(error)
            res.status(500).send({
                success:false,
                error:SOMETHING_WENT_WRONG
            })
        })
    }
})

app.post('/api/character/add', upload.single("character_image"),(req,res)=>{
    if(typeof req.body.name === 'undefined' ||
        typeof req.body.attributes === 'undefined' ||
        typeof req.body.description === 'undefined'){
        res.status(400).send({
            success:false,
            error:WRONG_BODY_FORMAT
        })
        return
    }

    let character

    if(typeof req.file==='undefined'){
        character = new Character(null, req.body.name, req.body.attributes, req.body.description, null)
    }else{
        character = new Character(null, req.body.name, req.body.attributes, req.body.description, req.file.filename)
    }

    dao.addCharacter(character).then(result=>{
        res.status(200).send({
            success:true,
            result:result
        })
    }).catch(error=>{
        console.error(error)
        res.status(500).send({
            success:false,
            error:SOMETHING_WENT_WRONG
        })
    })
})

app.put('/api/character/update', upload.single('character_image'),(req,res)=>{
    if(typeof req.body.name === 'undefined' ||
        typeof req.body.attributes === 'undefined' ||
        typeof req.body.description === 'undefined' ||
        typeof req.body.character_id === 'undefined'){
        res.status(400).send({
            success:false,
            error:WRONG_BODY_FORMAT
        })
        return
    }

    let character

    if(typeof req.file === 'undefined'){
        character = new Character(req.body.character_id, req.body.name, req.body.attributes, req.body.description, null)
    }else{
        character = new Character(req.body.character_id, req.body.name, req.body.attributes, req.body.description, req.file.filename)
    }

    dao.retrieveOneCharacter(new Character(req.body.character_id)).then(characterResult=>{
        if(characterResult[0].character_picture != null){
            fs.unlinkSync(UPLOADPATH+characterResult[0].character_picture)
        }

        dao.updateCharacter(character).then(result=>{
            res.status(200).send({
                success:true,
                result:result
            })
        }).catch(error=>{
            console.error(error)
            res.status(500).send({
                success:false,
                error:SOMETHING_WENT_WRONG
            })
        })
    }).catch(error=>{
        if(error === NO_SUCH_CONTENT){
            res.status(204).send({
                success:false,
                error:NO_SUCH_CONTENT
            })
            return
        }
        console.error(error)
        res.status(500).send({
            success:false,
            error:SOMETHING_WENT_WRONG
        })
    })
})

app.delete('/api/character/delete',(req,res)=>{
    if(typeof req.query.character_id === 'undefined'){
        res.status(400).send({
            success:false,
            error:WRONG_BODY_FORMAT
        })
        return
    }

    dao.retrieveOneCharacter(new Character(req.query.character_id)).then(characterResult=>{
        dao.deleteCharacter(new Character(req.query.character_id)).then(result=>{
            if(characterResult[0].character_picture != null){
                const filePath = UPLOADPATH+characterResult[0].character_picture
                fs.unlinkSync(filePath)

                res.status(200).send({
                    success:true,
                    result:SUCCESS
                })

                return
            }

            res.status(200).send({
                success:true,
                result:SUCCESS
            })
        }).catch(error=>{
            console.error(error)
            res.status(500).send({
                success:false,
                error:SOMETHING_WENT_WRONG
            })
        })
    }).catch(error=>{
        if(error === NO_SUCH_CONTENT){
            res.status(204).send({
                success:false,
                error:NO_SUCH_CONTENT
            })
            return
        }
        console.error(error)
        res.status(500).send({
            success:false,
            error:SOMETHING_WENT_WRONG
        })
    })
})

app.get('/api/articles/retrieve',(req,res)=>{
    if(typeof req.query.title === 'undefined'){
        dao.retrieveArticles().then(result=>{
            res.status(200).send({
                success:true,
                result:result
            })
        }).catch(error=>{
            console.error(error)
            res.status(500).send({
                success:false,
                error:SOMETHING_WENT_WRONG
            })
        })
    }else{
        dao.retrieveOneArticle(new Articles(null, req.query.title)).then(result=>{
            res.status(200).send({
                success:true,
                result:result
            })
        }).catch(error=>{
            if(error === NO_SUCH_CONTENT){
                res.status(204).send({
                    success:false,
                    error:NO_SUCH_CONTENT
                })
                return
            }
            console.error(error)
            res.status(500).send({
                success:false,
                error:SOMETHING_WENT_WRONG
            })
        })
    }
})

app.post('/api/articles/retrieve/one', (req,res)=>{
    if(typeof req.body.title === 'undefined'){
        res.status(400).send({
            success:false,
            error:WRONG_BODY_FORMAT
        })
        return
    }

    dao.retrieveOneArticle(new Articles(null, req.body.title)).then(result=>{
        res.status(200).send({
            success:true,
            result:result
        })
    }).catch(error=>{
        if(error === NO_SUCH_CONTENT){
            res.status(204).send({
                success:false,
                error:NO_SUCH_CONTENT
            })
            return
        }
        console.error(error)
        res.status(500).send({
            success:false,
            error:SOMETHING_WENT_WRONG
        })
    })
})

app.get('/api/articles/retrievebyuser', (req,res)=>{
    //console.log(req.query)

    if(typeof req.query.username==='undefined'){
        res.status(400).send({
            success:false,
            error:WRONG_BODY_FORMAT
        })
        return
    }

    dao.retrieveArticlesByUser(new User(null, req.query.username)).then(result=> {
        res.status(200).send({
            success:true,
            result: result
        })
    }).catch(error=>{
        if(error === NO_SUCH_CONTENT){
            res.status(204).send({
                success:false,
                error:NO_SUCH_CONTENT
            })
            return
        }
        console.error(error)
        res.status(500).send({
            success:false,
            error:SOMETHING_WENT_WRONG
        })
    })
})

app.post('/api/articles/add', upload.single('article_image'),(req,res)=>{
    if(typeof req.body.title === 'undefined' ||
       typeof req.body.body === 'undefined' ||
       typeof req.body.description === 'undefined' ||
       typeof req.body.username === 'undefined'){
        res.status(400).send({
            success: false,
            error: WRONG_BODY_FORMAT
        })
        return
    }

    dao.retrieveOneUser(new User(null, req.body.username)).then(userResult=>{
        dao.addArticle(new Articles(null, req.body.title, req.body.body, req.body.description, null, userResult[0].user_id)).then(result=>{
            res.status(200).send({
                success: true,
                result: result
            })
        }).catch(error=>{
            console.error(error)
            res.status(500).send({
                success:false,
                error:SOMETHING_WENT_WRONG
            })
        })
    }).catch(error=>{
        if(error === NO_SUCH_CONTENT){
            res.status(204).send({
                success: false,
                error: NO_SUCH_CONTENT
            })
            return
        }
        console.error(error)
        res.status(500).send({
            success: false,
            error: SOMETHING_WENT_WRONG
        })
    })
})

app.put('/api/article/update', (req,res)=>{
    if(typeof req.body.article_id === 'undefined' ||
        typeof req.body.title === 'undefined' ||
        typeof req.body.body === 'undefined' ||
        typeof req.body.description === 'undefined'){
        res.status(400).send({
            success: false,
            error: WRONG_BODY_FORMAT
        })
        return
    }

    dao.retrieveArticleById(new Articles(req.body.article_id)).then(articleResult=>{
        dao.updateArticle(new Articles(req.body.article_id, req.body.title, req.body.body, req.body.description, null,null)).then(result=>{
            res.status(200).send({
                success:true,
                result:result
            })
        }).catch(error=>{
            console.error(error)
            res.status(500).send({
                success:false,
                error:SOMETHING_WENT_WRONG
            })
        })
    }).catch(error=>{
        if(error === NO_SUCH_CONTENT){
            res.status(204).send({
                success:false,
                error:NO_SUCH_CONTENT
            })
            return
        }
        console.error(error)
        res.status(500).send({
            success: false,
            error: SOMETHING_WENT_WRONG
        })
    })
})

app.delete('/api/article/delete',(req,res)=>{
    if(typeof req.body.article_id==='undefined'){
        res.status(400).send({
            success:false,
            error:WRONG_BODY_FORMAT
        })
        return
    }

    dao.retrieveArticleById(new Articles(req.body.article_id)).then(result=>{
        dao.deleteArticle(new Articles(req.body.article_id)).then(result=>{
            res.status(200).send({
                success:true,
                result:SUCCESS
            })
        }).catch(error=>{
            console.error(error)
            res.status(500).send({
                success:false,
                error:SOMETHING_WENT_WRONG
            })
        })
    }).catch(error=>{
        if(error===NO_SUCH_CONTENT){
            res.status(204).send({
                success:false,
                error:NO_SUCH_CONTENT
            })
            return
        }
        console.error(error)
        res.status(500).send({
            success:false,
            error:SOMETHING_WENT_WRONG
        })
    })
})

app.listen(PORT, ()=>{
    console.info(`Server serving port ${PORT}`)
})