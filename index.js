import express from 'express';
import { engine } from 'express-handlebars';
import { Database } from './lib/database.js';
import bodyParser from 'body-parser';
import * as yup from 'yup';

const db = new Database('database.txt')
const contactSchema = yup.object({
  id: yup.string().optional(),
  first: yup.string().required(),
  last: yup.string().required(),
  email: yup.string().email().required(),
  phone: yup.string().required(),
})

const app = express();
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  let contacts = await db.getAll();
  const search = req.query.search?.toLowerCase()
  if (search)
    contacts = contacts.filter(c => c.first.toLowerCase().includes(search))
  res.render('home', { contacts, search: req.query.search })
})

app.get('/contacts/new', async (req, res) => res.render('new'))
app.get('/contacts/:id', async (req, res) => {
  const contact = await db.get(req.params.id);
  return res.render('new', { contact })
})
app.post('/contacts/new', async (req, res) => {
  try {
    const newContact = await contactSchema.validate(req.body, { abortEarly: false })
    if (newContact.id) await db.remove(newContact.id)
    await db.insert(newContact)
    return res.redirect(303, '/')
  } catch (e) {
    console.log(JSON.stringify(e.inner))
    const errors = (e?.inner || []).reduce((acc, val) => ({ ...acc, [val.path]: val.errors[0] }), {})
    return res.render('new', { contact: req.body, errors })
  }
})
app.delete('/contacts/:id', async (req, res) => {
  await db.remove(req.params.id);
  return res.redirect(303, '/')
})

app.listen(3000)