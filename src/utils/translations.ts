export type AppLanguage = 'en' | 'bn';

export const translations = {
  en: {
    appTitle: 'Borrow Manager',
    dashboard: 'Dashboard',
    timeline: 'Timeline',
    settings: 'Settings',
    addTransaction: 'Add Transaction',

    // Settings
    preferences: 'Preferences',
    darkTheme: 'Dark Theme',
    defaultCurrency: 'Default Currency',
    language: 'Language',
    dataManagement: 'Data Management',
    exportCSV: 'Export as CSV',
    clearAllData: 'Clear All Data',
    clearDataConfirm: 'Are you sure you want to clear ALL data? This action cannot be undone.',

    // Dashboard
    totalLent: 'Total Lent',
    totalBorrowed: 'Total Borrowed',
    overallNet: 'Overall Net',
    activeBalances: 'Active Balances',
    noActiveBalances: 'No active balances right now. Add a transaction to get started!',
    balancesByPerson: 'Balances by Person',
    recentTransactions: 'Recent Transactions',
    searchPerson: 'Search person...',
    all: 'All',
    filterBorrowed: 'Borrowed',
    filterLent: 'Lent',

    // PersonSummaryList
    netBalance: 'Net balance',
    owesYou: 'Owes you',
    youOwe: 'You owe',
    settled: 'Settled',
    shareCardTitleOweMe: 'পাওনা হিসাব', // Default to Bangla for ascii since requested (or keep dual?)
    shareCardTitleIOwe: 'দেনা হিসাব',
    shareCardName: 'Name',
    shareCardOweMeText: 'Owes',
    shareCardIOweText: 'Debt',
    shareCardNoteOweMe: 'Please settle up at your convenience! 😇',
    shareCardNoteIOwe: 'I will settle up soon! 🤝',
    shareCardFooter: 'Generated via Borrow Manager',

    // TransactionList
    // TransactionList
    overdue: 'OVERDUE',
    settledBadge: 'SETTLED',
    markSettled: 'Mark Settled',
    delete: 'Delete',
    due: 'Due:',
    noTransactions: 'No transactions found',
    addRecordPrompt: 'Add a borrow or lent record to see it here.',

    // TransactionForm
    iBorrowed: 'I Borrowed',
    iLent: 'I Lent',
    personName: 'Person Name',
    amount: 'Amount',
    currency: 'Currency',
    date: 'Date',
    dueDate: 'Due Date',
    tags: 'Tags (Comma separated)',
    note: 'Note (Optional)',
    cancel: 'Cancel',
    saveTransaction: 'Save Transaction',
    personPlaceholder: 'E.g., Alex',
    tagsPlaceholder: 'e.g. dinner, trip',
    notePlaceholder: 'Lunch, movie ticket...',

    // Timeline
    transactionTimeline: 'Transaction Timeline',
    noTransactionsYet: 'No transactions recorded yet.',
    lent: 'lent',
    borrowed: 'borrowed',
    settledDebtWith: 'Settled debt with',
    borrowedFrom: 'Borrowed from',
    lentTo: 'Lent to'
  },
  bn: {
    appTitle: 'ধার ম্যানেজার',
    dashboard: 'ড্যাশবোর্ড',
    timeline: 'ইতিহাস',
    settings: 'সেটিংস',
    addTransaction: 'লেনদেন যুক্ত করুন',

    // Settings
    preferences: 'পছন্দসমূহ',
    darkTheme: 'ডার্ক থিম',
    defaultCurrency: 'ডিফল্ট মুদ্রা',
    language: 'ভাষা',
    dataManagement: 'ডেটা পরিচালনা',
    exportCSV: 'CSV হিসেবে এক্সপোর্ট করুন',
    clearAllData: 'সব ডেটা মুছুন',
    clearDataConfirm: 'আপনি কি নিশ্চিত যে আপনি সব ডেটা মুছতে চান? এটি আর ফিরিয়ে আনা যাবে না।',

    // Dashboard
    totalLent: 'মোট ধার দেওয়া',
    totalBorrowed: 'মোট ধার নেওয়া',
    overallNet: 'সর্বমোট ব্যালেন্স',
    activeBalances: 'সক্রিয় হিসাব',
    noActiveBalances: 'বর্তমানে কোনো সক্রিয় হিসাব নেই। শুরু করতে লেনদেন যুক্ত করুন!',
    balancesByPerson: 'ব্যক্তিভিত্তিক ব্যালেন্স',
    recentTransactions: 'সাম্প্রতিক লেনদেন',
    searchPerson: 'নাম দিয়ে খুঁজুন...',
    all: 'সব',
    filterBorrowed: 'ধার নিয়েছি',
    filterLent: 'ধার দিয়েছি',

    // PersonSummaryList
    netBalance: 'নেট ব্যালেন্স',
    owesYou: 'আপনি পাবেন',
    youOwe: 'আপনি দিবেন',
    settled: 'নিষ্পন্ন',
    shareCardTitleOweMe: 'পাওনা হিসাব',
    shareCardTitleIOwe: 'দেনা হিসাব',
    shareCardName: 'নাম',
    shareCardOweMeText: 'পাওনা',
    shareCardIOweText: 'দেনা',
    shareCardNoteOweMe: 'সুবিধা অনুযায়ী পরিশোধ করে দিও! 😇',
    shareCardNoteIOwe: 'আমি খুব শিঘ্রই দিয়ে দেব! 🤝',
    shareCardFooter: 'Borrow Manager থেকে তৈরি',

    // TransactionList
    // TransactionList
    overdue: 'মেয়াদোত্তীর্ণ',
    settledBadge: 'নিষ্পন্ন',
    markSettled: 'নিষ্পন্ন করুন',
    delete: 'মুছুন',
    due: 'মেয়াদ:',
    noTransactions: 'কোনো লেনদেন পাওয়া যায়নি',
    addRecordPrompt: 'এখানে দেখতে একটি ধার বা লোন রেকর্ড যুক্ত করুন।',

    // TransactionForm
    iBorrowed: 'আমি ধার নিয়েছি',
    iLent: 'আমি ধার দিয়েছি',
    personName: 'ব্যক্তির নাম',
    amount: 'পরিমান',
    currency: 'মুদ্রা',
    date: 'তারিখ',
    dueDate: 'পরিশোধের তারিখ',
    tags: 'ট্যাগ (কমা দিয়ে লিখুন)',
    note: 'মন্তব্য (ঐচ্ছিক)',
    cancel: 'বাতিল',
    saveTransaction: 'সংরক্ষণ করুন',
    personPlaceholder: 'যেমন: রহিম',
    tagsPlaceholder: 'যেমন: খাবার, ট্রিপ',
    notePlaceholder: 'দুপুরের খাবার, সিনেমার টিকিট...',

    // Timeline
    transactionTimeline: 'লেনদেনের ইতিহাস',
    noTransactionsYet: 'এখনও কোনো লেনদেন রেকর্ড করা হয়নি।',
    lent: 'ধার দিয়েছেন',
    borrowed: 'ধার নিয়েছেন',
    settledDebtWith: 'হিসাব নিষ্পন্ন করা হয়েছে',
    borrowedFrom: 'ধার নিয়েছেন',
    lentTo: 'ধার দিয়েছেন'
  }
};

export type TranslationKey = keyof typeof translations.en;
