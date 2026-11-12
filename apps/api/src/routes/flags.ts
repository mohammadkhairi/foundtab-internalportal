import { Router } from 'express'
import * as flagController from '../controllers/flagController'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    res.json(await flagController.getGlobalFlags())
  } catch (err) {
    next(err)
  }
})

router.put('/', async (req, res, next) => {
  try {
    res.json(await flagController.updateGlobalFlags({ flags: req.body as unknown, actorId: null }))
  } catch (err) {
    next(err)
  }
})

export { router as flagsRouter }
