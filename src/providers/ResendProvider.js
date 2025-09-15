const { Resend } = require('resend')
require('dotenv').config()

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ADMIN_SENDER_EMAIL = 'trello@dinchan.dev'
// const ADMIN_SENDER_EMAIL = 'onboarding@resend.dev'
// const RESEND_API_KEY = 're_HfkjM4ha_5qBKLg84rHDkX9Yk51tYqPt3'

const resendInstance = new Resend(RESEND_API_KEY)

// Function send email
const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resendInstance.emails.send({
      from: ADMIN_SENDER_EMAIL,
      to,
      subject,
      html
    })
    return data
  } catch (error) {
    throw error
  }
}

module.exports = { sendEmail }