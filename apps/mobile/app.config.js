module.exports = ({ config }) => ({
  ...config,
  name: "Deesse Starter",
  slug: "deesse-expo-next",
  scheme: "deesse-expo",
  userInterfaceStyle: "automatic",
  plugins: ["expo-router", "expo-secure-store"],
  android: { package: "js.deesse.expostarter" },
  ios: { bundleIdentifier: "js.deesse.expostarter" },
  extra: {
    ...config.extra,
    eas: process.env.EXPO_PROJECT_ID ? { projectId: process.env.EXPO_PROJECT_ID } : undefined,
  },
})
