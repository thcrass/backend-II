import passport from "passport"
import passportJWT from "passport-jwt"
import local from "passport-local"
import { userModel } from "../dao/models/userModel.js"
import bcrypt from "bcrypt"

const buscarToken = req => {
    let token = null

    // Buscar en headers Authorization 
    if (req.headers && req.headers.authorization) {
        const authHeader = req.headers.authorization
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7)
        }
    }

    return token
}

export const iniciarPassport = () => {
    // paso 1
    passport.use("current", 
        new passportJWT.Strategy(
            {
                secretOrKey: process.env.SECRET || "CoderCoder123",
                jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([buscarToken])
            },
            async(contenidoToken, done) => {
                try {
                    // return done(null, false)   // fallo en la validacion
                    return done(null, contenidoToken)  // todo OK
                } catch (error) {
                    return done(error)  // error
                }
            }
        )
    )

    passport.use("login", 
        new local.Strategy(
            {
                usernameField: "email"
            }, 
            async(username, password, done) => {
                try {
                    console.log("passport...!!!")
                    
                    // Buscar usuario en MongoDB (en lugar de JSON)
                    let usuario = await userModel.findOne({ email: username })
                    
                    if (!usuario) return done(null, false)  // fallo en la validacion
                
                    if (!bcrypt.compareSync(password, usuario.password)){
                        return done(null, false)
                    } 
                
                    return done(null, usuario)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    // paso 1'   solo aplican si usamos sessions!!!
    // passport.serializeUser()
    // passport.deserializeUser()
}