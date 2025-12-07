# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img "MyARK Logo" [ref=e5]
      - heading "Welcome Back" [level=1] [ref=e6]
      - paragraph [ref=e7]: Enter your email and password to sign in
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]: Email Address
        - textbox "Email Address" [ref=e11]:
          - /placeholder: m@example.com
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Password
          - link "Forgot password?" [ref=e15] [cursor=pointer]:
            - /url: "#"
        - textbox "Password" [ref=e16]
      - button "Sign In" [ref=e17] [cursor=pointer]
      - generic [ref=e22]: Or continue with
      - generic [ref=e23]:
        - button [ref=e24] [cursor=pointer]:
          - img
        - button [ref=e25] [cursor=pointer]:
          - img
        - button [ref=e26] [cursor=pointer]:
          - img
    - generic [ref=e27]:
      - text: Don't have an account?
      - link "Sign Up" [ref=e28] [cursor=pointer]:
        - /url: /signup
  - region "Notifications (F8)":
    - list
```