import { Router } from 'express'
import { z } from 'zod'
import { validateBody } from '../middleware/validateBody'
import * as planController from '../controllers/planController'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    res.json(await planController.listPlans())
  } catch (err) {
    next(err)
  }
})

const moduleAccessSchema = z
  .object({ planId: z.string().uuid(), moduleKey: z.string().min(1), enabled: z.boolean() })
  .strict()

router.patch('/module-access', validateBody(moduleAccessSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof moduleAccessSchema>
    res.json(
      await planController.updateModuleAccess({
        planId: body.planId,
        moduleKey: body.moduleKey,
        enabled: body.enabled,
        actorId: null,
      }),
    )
  } catch (err) {
    next(err)
  }
})

export { router as plansRouter }
