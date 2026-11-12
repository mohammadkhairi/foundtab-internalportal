import { Router } from 'express'
import { z } from 'zod'
import { validateBody } from '../middleware/validateBody'
import * as orgController from '../controllers/orgController'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    res.json(await orgController.listOrgs())
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await orgController.getOrg({ id: String(req.params['id']) }))
  } catch (err) {
    next(err)
  }
})

const planSchema = z.object({ plan: z.string().min(1) }).strict()

router.patch('/:id/plan', validateBody(planSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof planSchema>
    res.json(
      await orgController.updateOrgPlan({
        id: String(req.params['id']),
        plan: body.plan,
        actorId: null,
      }),
    )
  } catch (err) {
    next(err)
  }
})

router.get('/:id/feature-overrides', async (req, res, next) => {
  try {
    res.json(await orgController.getOrgFeatureOverrides({ id: String(req.params['id']) }))
  } catch (err) {
    next(err)
  }
})

router.put('/:id/feature-overrides', async (req, res, next) => {
  try {
    res.json(
      await orgController.updateOrgFeatureOverrides({
        id: String(req.params['id']),
        overrides: req.body as unknown,
        actorId: null,
      }),
    )
  } catch (err) {
    next(err)
  }
})

export { router as orgsRouter }
