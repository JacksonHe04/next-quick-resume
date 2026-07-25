# SAYLESS iNon SSO cutover

## Goal

Replace SAYLESS registration, password authentication, password recovery, and
local sessions with the central iNon SSO while preserving every existing
user-owned SAYLESS record.

## Identity mapping

SAYLESS keeps its local `users.id` as the owner key for batches, resumes,
submissions, interviews, and questions. A new nullable, unique
`users.inon_user_id` links that local owner to the immutable central iNon user
ID.

After a successful iNon OAuth callback:

1. resolve an existing local user by `inon_user_id`;
2. otherwise match an unlinked legacy user by the SSO-verified email and bind
   it atomically;
3. otherwise create a local SAYLESS user and preferences row for the new iNon
   member.

An email match is accepted only after the central account has completed its
verification flow. A local row already linked to another iNon identity is never
reassigned.

## Cutover surface

- Mount `@inon-ai/inon-sso` at `/api/auth/inon/[action]`.
- Send `/login` and `/register` into the same central OAuth login flow.
- Replace local session lookup in server components, route handlers, and
  server actions with the encrypted iNon project session.
- Keep guest/demo read behavior unchanged.
- Move password and username management to the central iNon account UI.
- Remove SAYLESS self-service account deletion and local password controls.
- Make logout revoke the central project refresh token and clear the SAYLESS
  project cookie.

## Deployment boundary

SAYLESS receives its own confidential OAuth client ID and secret, an independent
project-session encryption secret, and the public origin
`https://sayless.inon.space`. No secret is stored in Git or the npm package.

The central SSO creates the ordinary SAYLESS project membership on first
authorization. Project administrator status remains centrally assigned by the
global iNon super administrator.

## Implemented

- Published and pinned `@inon-ai/inon-sso@0.1.0` from the public npm registry.
- Added the SAYLESS OAuth callback and project-session route at
  `/api/auth/inon/[action]`.
- Replaced server-component, route-handler, and server-action identity lookup
  with the encrypted iNon project session and local owner mapping.
- Redirected both `/login` and `/register` to the central OAuth flow.
- Disabled every legacy registration, password login, password recovery,
  development login, local logout, profile mutation, password mutation, and
  account deletion endpoint with an explicit `410` migration response.
- Replaced local password/profile/delete settings with a link to the central
  iNon account page and project-scoped logout.

The focused identity-mapping tests, TypeScript check, affected-file lint, and a
full Next.js production build all completed successfully.
