export const getTaskInitInfo = () => ({
  files: [],
})
export const getTaskInitFormValue = () => ({
  title: '',
  desc: '',
  cost: 1,
  info: getTaskInitInfo(),
})

export type TaskFormValue = ReturnType<typeof getTaskInitFormValue>
export type TaskInfo = ReturnType<typeof getTaskInitInfo>
