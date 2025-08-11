import passport from "passport"

export const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, { session: false }, (err, user, info) => {
            if (err) return next(err)
            if (!user) {
                return res.status(401).json({ 
                    error: info?.message || `Error en autenticación ${strategy}` 
                })
            }
            req.user = user
            next()
        })(req, res, next)
    }
}