# EDUKEN ChatGPT Action setup

This integration lets a configured ChatGPT custom GPT submit content to the existing secure EDUKEN draft-intake endpoint. It does not grant this ordinary chat a new tool automatically.

## Safety behavior

- The endpoint requires the private `EDUKEN_DRAFT_INTAKE_SECRET` as a Bearer credential.
- The secret must be entered only in the Action's authentication settings. Never put it in this repository, an OpenAPI schema, an announcement, or a chat message.
- The backend rejects publication-control fields and forces `is_published=false`.
- The assistant must tell the administrator when a draft is successfully saved and provide its returned ID.
- If the call fails, the assistant must not claim the draft was saved.
- The administrator alone reviews and publishes from EDUKEN Admin.

## Configuration

1. In a ChatGPT account that supports creating custom GPTs and Actions, create a private GPT named **EDUKEN Draft Assistant**.
2. Add the contents of `eduken-chatgpt-action-openapi.yaml` as the Action schema.
3. Set Authentication to **API Key**, select **Bearer**, and enter the existing `EDUKEN_DRAFT_INTAKE_SECRET` privately. Do not share the value with anyone or paste it into chat.
4. Keep the GPT private. Add instructions that it may create drafts only, must verify source details where appropriate, must never publish, and must report the returned draft ID only after a successful 201 response.
5. Test with a clearly labelled harmless test announcement, confirm it appears as unpublished in the admin, then remove the test draft manually if desired.

## Important account limitation

Creating and configuring custom GPTs/Actions is account-plan dependent. If the user's current ChatGPT plan does not offer GPT creation, this schema is still the prepared integration contract, but the action cannot be activated in that account until an eligible configuration route is available.

## Endpoint

`POST https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-draft-intake`

The endpoint is the existing production function. This documentation/spec change does not deploy or modify the production website or function.
