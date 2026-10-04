# Security Specification: The Blind Spot

## 1. Data Invariants
1. **User Data Isolation**: All decision documents and analysis documents are scoped under `/users/{userId}/...`. A user with UID `X` can only read, create, update, or delete data within `/users/{X}/...`. Cross-user data access is strictly forbidden.
2. **Identity Integrity**: For decisions created under `/users/{userId}/decisions/{decisionId}`, the document's `userId` field must match `request.auth.uid`.
3. **Immutability of Key Fields**: Once created, `userId` and `createdAt` cannot be altered in updates.
4. **Bounded String and Array Lengths**: All strings and lists are length-checked to prevent denial-of-wallet or storage abuse.
5. **No Public or Blanket Reads**: Anonymous reads and writes are blocked. Authenticated users cannot list other users' data.
6. **Subcollection Integrity**: Analyses can only be written by the owner of the parent decision document.

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)
1. Unauthenticated read on `/users/user123/decisions`
2. Unauthenticated write to `/users/user123/decisions/dec1`
3. Authenticated user `user456` attempting to read `/users/user123/decisions`
4. Authenticated user `user456` attempting to write `/users/user123/decisions/dec1`
5. Authenticated user `user123` attempting to write decision with `userId: "user456"` (Spoofed identity)
6. Authenticated user `user123` attempting to write decision with oversized title (> 200 characters)
7. Authenticated user `user123` attempting to change `userId` during an update
8. Authenticated user `user123` attempting to inject junk document ID like `../../../etc/passwd`
9. Authenticated user `user456` attempting to read `/users/user123/decisions/dec1/analyses/analysis1`
10. Authenticated user `user456` attempting to write `/users/user123/decisions/dec1/analyses/analysis1`
11. Authenticated user `user123` attempting to write analysis referencing a non-existent decisionId
12. Blanket list queries attempting to bypass per-user collection boundaries
