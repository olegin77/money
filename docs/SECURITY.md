# Security Documentation

## 🔐 Security Features

### Authentication & Authorization

**JWT Tokens:**
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- Token rotation on refresh
- Secure token storage (httpOnly cookies recommended for production)

**Password Security:**
- Bcrypt hashing (12 rounds)
- Minimum 8 characters
- Required: uppercase, lowercase, number, special character
- Password reset with time-limited tokens

**Two-Factor Authentication:**
- TOTP (Time-based One-Time Password)
- QR code generation for authenticator apps
- 6-digit codes
- 2-step window for clock skew tolerance

### API Security

**Rate Limiting:**
- Auth endpoints: 100 requests/minute
- API endpoints: 300 requests/minute
- Redis-based sliding window
- IP-based tracking

**Input Validation:**
- class-validator on all DTOs
- Whitelist validation
- Type transformation
- SQL injection prevention

**Headers:**
- Helmet.js for security headers
- CORS configuration
- CSRF protection
- XSS prevention

### Data Security

**Encryption:**
- Financial data: AES-256-GCM (ready for implementation)
- Passwords: bcrypt
- 2FA secrets: encrypted storage
- Sensitive data exclusion from logs

**Database:**
- Parameterized queries (TypeORM)
- Foreign key constraints
- Indexes for performance
- Soft delete for data retention

### Access Control

**Role-Based Access Control (RBAC):**
- User roles: admin, user
- Perimeter roles: owner, manager, contributor, viewer
- Permission matrix enforcement
- Guard-based protection

**Permission Matrix:**
```
Resource      | Owner | Manager | Contributor | Viewer
------------- |-------|---------|-------------|-------
View          | ✓     | ✓       | ✓           | ✓
Add Expenses  | ✓     | ✓       | ✓           | ✗
Edit          | ✓     | ✓       | ✗           | ✗
Share         | ✓     | ✓       | ✗           | ✗
Delete        | ✓     | ✗       | ✗           | ✗
```

## 🛡️ GDPR Compliance

### Data Rights

**Right to Access:**
- GET /users/me - User profile
- GET /users/export - Full data export (TODO)

**Right to Rectification:**
- PATCH /users/me - Update profile
- Full edit capabilities for own data

**Right to Erasure:**
- DELETE /users/me - Account deletion
- Cascade delete on all related data
- 30-day grace period (TODO)

**Right to Data Portability:**
- JSON export of all user data (TODO)
- CSV export option (TODO)

### Data Processing

**Consent Management:**
- Explicit consent on registration
- Cookie consent (TODO)
- Privacy policy acceptance (TODO)

**Data Minimization:**
- Only collect necessary data
- No tracking without consent
- Anonymous analytics (TODO)

**Data Retention:**
- Active user data: Indefinite
- Deleted accounts: 30-day grace period (TODO)
- Audit logs: 90 days
- Backup retention: 30 days

## 🔒 Security Best Practices

### Development

1. **Never commit secrets**
   - Use environment variables
   - .env in .gitignore
   - Separate configs for dev/prod

2. **Input validation**
   - Validate all user input
   - Use DTOs with class-validator
   - Sanitize output

3. **Error handling**
   - Don't expose stack traces
   - Generic error messages
   - Detailed logging server-side

4. **Dependencies**
   - Regular updates
   - Snyk security scanning
   - Lock files committed

### Production

1. **Environment**
   - NODE_ENV=production
   - DB_SYNCHRONIZE=false
   - Strong secrets (64+ chars)
   - HTTPS only

2. **Database**
   - Read-only users for analytics
   - Connection pooling
   - Regular backups
   - Encrypted connections

3. **Monitoring**
   - Error tracking (Sentry)
   - Access logs
   - Audit trail
   - Performance metrics

4. **Updates**
   - Security patches immediately
   - Regular dependency updates
   - Penetration testing quarterly

## 🚨 Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Helmet.js configured
- [ ] SQL injection tests passed
- [ ] XSS prevention verified
- [ ] CSRF protection enabled
- [ ] Input validation on all endpoints
- [ ] Authentication on protected routes
- [ ] Admin routes protected
- [ ] File upload restrictions
- [ ] Error messages sanitized
- [ ] Logging configured
- [ ] Backup strategy in place

### Post-Deployment

- [ ] Security scan (Snyk)
- [ ] Penetration testing
- [ ] SSL certificate valid
- [ ] Monitoring active
- [ ] Audit logs enabled
- [ ] Incident response plan
- [ ] Regular security reviews
- [ ] Dependency updates scheduled

## 🔍 Vulnerability Management

### Reporting

**Security Issues:**
- Email: security@fintrack.pro
- Encrypted: PGP key (TODO)
- Response time: 24 hours
- Disclosure: Responsible disclosure policy

### Common Vulnerabilities (OWASP Top 10)

**A01: Broken Access Control**
- ✅ RBAC implemented
- ✅ Permission checks on all operations
- ✅ User isolation

**A02: Cryptographic Failures**
- ✅ Bcrypt for passwords
- ⚠️ AES-256 for financial data (TODO)
- ✅ HTTPS in production

**A03: Injection**
- ✅ Parameterized queries
- ✅ Input validation
- ✅ Output encoding

**A04: Insecure Design**
- ✅ Security by design
- ✅ Threat modeling
- ✅ Security reviews

**A05: Security Misconfiguration**
- ✅ Secure defaults
- ✅ Helmet.js
- ✅ Production config separate

**A06: Vulnerable Components**
- ✅ Regular updates
- ✅ Snyk scanning
- ✅ Lock files

**A07: Authentication Failures**
- ✅ Strong password policy
- ✅ 2FA available
- ✅ Session management
- ✅ Rate limiting

**A08: Software and Data Integrity**
- ✅ CI/CD pipeline
- ✅ Code review required
- ✅ Dependency verification

**A09: Logging Failures**
- ✅ Comprehensive logging
- ⚠️ Audit trail (partial)
- ⚠️ Monitoring (TODO)

**A10: Server-Side Request Forgery**
- ✅ Input validation
- ✅ URL whitelist
- ✅ No user-controlled URLs

## 📝 Audit Log

**Logged Events:**
- User registration/login/logout
- Password changes
- 2FA enable/disable
- Expense/Income creation (TODO)
- Admin actions (TODO)
- Permission changes (TODO)

**Log Format:**
```json
{
  "timestamp": "2026-02-17T10:30:00Z",
  "userId": "uuid",
  "action": "login",
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "success": true,
  "metadata": {}
}
```

## 🔐 Production Security Hardening

1. **Database:**
   - Disable public access
   - Use connection pooling
   - Enable SSL/TLS
   - Regular backups
   - Point-in-time recovery

2. **API:**
   - Use reverse proxy (nginx)
   - Enable rate limiting
   - Add WAF (Web Application Firewall)
   - DDoS protection
   - API key rotation

3. **Frontend:**
   - CSP headers
   - Subresource integrity
   - Secure cookies
   - HTTPS only
   - HSTS enabled

4. **Infrastructure:**
   - Firewall rules
   - VPN access for admin
   - Separate staging/production
   - Container security scanning
   - Secrets management (Vault)

## 🎯 Security Roadmap

**Immediate (Week 18):**
- [ ] Financial data encryption
- [ ] Audit log implementation
- [ ] GDPR export/erasure
- [ ] Security audit
- [ ] Penetration testing

**Short-term (Month 2-3):**
- [ ] OAuth integration
- [ ] Email verification
- [ ] Session management UI
- [ ] Security headers optimization
- [ ] WAF implementation

**Long-term (Month 4-6):**
- [ ] Bug bounty program
- [ ] SOC 2 compliance
- [ ] Regular pen testing
- [ ] Incident response drills
- [ ] Security training
