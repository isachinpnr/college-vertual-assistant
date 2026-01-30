# 🗄️ MongoDB Setup for Persistent FAQ Storage

## Why MongoDB?

Netlify Functions use `/tmp` directory which is **ephemeral** - data gets cleared between deployments or function invocations. MongoDB provides **persistent storage** so your FAQs will never disappear!

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create MongoDB Atlas Account (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Create your account (it's completely free!)

### Step 2: Create a Free Cluster

1. After login, click **"Build a Database"**
2. Choose **"M0 FREE"** (Free tier - perfect for this project)
3. Select a cloud provider and region (choose closest to you)
4. Click **"Create"**
5. Wait 3-5 minutes for cluster to be created

### Step 3: Create Database User

1. In **"Database Access"** section, click **"Add New Database User"**
2. Choose **"Password"** authentication
3. Enter username: `college-assistant-admin`
4. Enter password: (create a strong password, save it!)
5. Set privileges: **"Atlas Admin"**
6. Click **"Add User"**

### Step 4: Whitelist IP Address

1. In **"Network Access"** section, click **"Add IP Address"**
2. Click **"Allow Access from Anywhere"** (for Netlify)
   - Or add `0.0.0.0/0` to allow all IPs
3. Click **"Confirm"**

### Step 5: Get Connection String

1. Go to **"Database"** section
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `college-assistant` (or keep default)

**Example:**
```
mongodb+srv://college-assistant-admin:YourPassword123@cluster0.xxxxx.mongodb.net/college-assistant?retryWrites=true&w=majority
```

### Step 6: Add to Netlify

1. Go to your Netlify site dashboard
2. Go to **"Site settings"** → **"Environment variables"**
3. Click **"Add variable"**
4. **Key**: `MONGODB_URI`
5. **Value**: Paste your connection string
6. Click **"Save"**

### Step 7: Redeploy

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for deployment to complete

---

## ✅ That's It!

Your FAQs will now persist permanently! They won't disappear after:
- ✅ Website refresh
- ✅ Netlify deployment
- ✅ Function invocations
- ✅ Server restarts

---

## 🔍 Verify It's Working

1. Add a new FAQ as admin
2. Refresh the page
3. Your FAQ should still be there! 🎉

---

## 🆓 Free Tier Limits

MongoDB Atlas Free Tier includes:
- ✅ 512 MB storage (plenty for FAQs)
- ✅ Shared RAM
- ✅ No credit card required
- ✅ Perfect for this project

---

## 🐛 Troubleshooting

### Issue: Connection failed
**Solution**: 
- Check your connection string is correct
- Verify password doesn't have special characters (URL encode if needed)
- Check IP whitelist includes `0.0.0.0/0`

### Issue: FAQs still disappearing
**Solution**:
- Check Netlify function logs for errors
- Verify `MONGODB_URI` environment variable is set
- Make sure you redeployed after adding the variable

---

## 📝 Alternative: Without MongoDB (Temporary Solution)

If you don't want to set up MongoDB right now, the system will use file storage (which resets). For a quick fix, you can:

1. Use the frontend localStorage backup (I'll add this)
2. Export FAQs regularly
3. Set up MongoDB later for permanent storage

---

**Need Help?** Check MongoDB Atlas documentation or Netlify function logs.
