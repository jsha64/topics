import * as fs from 'fs'
import path from 'path'

export function getAllTopics() {
  let dirPath = path.join(process.cwd(), 'src/context/topics')

  const topics: any[] = []

  fs.readdirSync(dirPath).forEach(function (file: any) {
    let fileName = file
    if (fileName.includes('.json')) {
      const json = require('./' + fileName)

      for (let topicName in json.skill) {
        topics.push(json.skill[topicName])
      }
    }
  })

  return topics
}

export function getAllPossibleRoutes() {
  let topics = getAllTopics().map((topic) => ({
    id: topic.id,
    parents: topic.parents,
  }))

  topics = topics.concat([
    { id: 'development', parents: null },
    { id: 'frontend', parents: ['development'] },
    { id: 'fullstack', parents: ['development'] },
  ])

  let raw = [],
    routes = []

  for (let { id } of topics) {
    raw.push(getChildren(id, topics))
  }

  for (let item of raw) {
    routes.push(getRoute(item.id, item.children))
  }

  routes = routes
    .flat(10)
    .filter((route) => !!route)
    .map((route) => ({ topic: route.split('/') }))

  return routes
}

function getRoute(id: string, raw?: any[]): any[] {
  return [id, raw?.map((item) => getRoute(`${id}/${item.id}`, item.children))]
}

function getChildren(id: string, topics: any[]): { id: string; children?: any[] } {
  const children = topics.filter(
    (topic) => !!topic.parents?.includes(id) && topic.id !== id
  )

  return children.length
    ? { id, children: children.map((child) => getChildren(child.id, topics)) }
    : { id }
}
