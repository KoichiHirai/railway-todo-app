import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Header } from '../components/Header';
import { url } from '../const';
import PropTypes from 'prop-types';
import './home.scss';

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState('todo'); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  useEffect(() => {
    const listId = lists[0]?.id;
    if (typeof listId !== 'undefined') {
      setSelectListId(listId);
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };
  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul className="list-tab">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId;
              return (
                <li
                  key={key}
                  className={`list-tab-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectList(list.id)}
                >
                  {list.title}
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// 表示するタスク
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props;
  const today = new Date();

  if (tasks === null) return <></>;
  console.log('置き換え前');
  console.log(tasks);
  tasks.map((task) => {
    const date = new Date(task.limit);
    date.setTime(date.getTime() - 9 * 3600 * 1000); //扱っている時間が標準時なので、標準時に戻す
    task.limit = date;
    return task.limit;
  });
  console.log('置き換え後');
  console.log(tasks);

  if (isDoneDisplay == 'done') {
    return (
      <ul>
        {tasks
          .filter((task) => {
            return task.done === true;
          })
          .map((task, key) => (
            <li key={key} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                {task.title}
                <br />
                {`期限: ${task.limit.getFullYear()}年
                  ${`${task.limit.getMonth() + 1}`.replace(/^0/, '')}月
                  ${`${task.limit.getDate()}`.replace(/^0/, '')}日
                  ${`${task.limit.getHours()}`.replace(/^0/, '')}時
                  ${`${task.limit.getMinutes()}`.replace(/^0/, '')}分`}
                （
                {task.limit - today >= 0
                  ? `期限まで残り${Math.floor((task.limit - today) / (1000 * 60 * 60 * 24))}日
                  ${Math.floor(((task.limit - today) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}時間
                  ${Math.floor(((task.limit - today) % (1000 * 60 * 60)) / (1000 * 60))}分`
                  : '期限を超過してます'}
                ）
                <br />
                {task.done ? '完了' : '未完了'}
              </Link>
            </li>
          ))}
      </ul>
    );
  }

  return (
    <ul>
      {tasks
        .filter((task) => {
          return task.done === false;
        })
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              {`期限: ${task.limit.getFullYear()}年
                ${`${task.limit.getMonth() + 1}`.replace(/^0/, '')}月
                ${`${task.limit.getDate()}`.replace(/^0/, '')}日
                ${`${task.limit.getHours()}`.replace(/^0/, '')}時
                ${`${task.limit.getMinutes()}`.replace(/^0/, '')}分`}
              （
              {task.limit - today >= 0
                ? `期限まで残り${Math.floor((task.limit - today) / (1000 * 60 * 60 * 24))}日
                ${Math.floor(((task.limit - today) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}時間
                ${Math.floor(((task.limit - today) % (1000 * 60 * 60)) / (1000 * 60))}分`
                : '期限を超過してます'}
              ）
              <br />
              {task.done ? '完了' : '未完了'}
            </Link>
          </li>
        ))}
    </ul>
  );
};

Tasks.propTypes = {
  tasks: PropTypes.array, // tasks が配列であることを指定
  selectListId: PropTypes.string, // selectListId が文字列であることを指定
  isDoneDisplay: PropTypes.string, // isDoneDisplay がブール値であることを指定
};
