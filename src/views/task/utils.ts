export const getTaskInitFormValue = () => ({
  title: '',
  desc: '',
  cost: 1,
  info: {
    files: [],
  },
})

export type TaskFormValue = ReturnType<typeof getTaskInitFormValue>
