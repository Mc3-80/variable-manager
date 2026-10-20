# Variable Manager 📁

変数をグループごとに整理し、サイドバーに一覧表示する VS Code 拡張機能です。

A VS Code extension that organizes variables into groups and displays them in the sidebar.

## Features/機能 ⚙️

専用の見出しを使って変数をグループ分けすると、サイドバーに変数の一覧が表示されま
す。

Use special comment markers to organize variables into groups. The variables are then displayed in the sidebar.

|        見出し        |                    機能                    |
| :------------------: | :----------------------------------------: |
|      //\HEADER:      | グループを開始し、グループ名を指定します。 |
| （変数の宣言）//説明 |    変数を一覧に追加し、説明を付けます。    |
|        //\END        |        現在のグループを終了します。        |

|               Syntax               |                   Description                   |
| :--------------------------------: | :---------------------------------------------: |
|             //\HEADER:             |     Starts a group and specifies its name.      |
| Variable declaration //description | Adds a variable to the list with a description. |
|               //\END               |             Ends the current group.             |

\!\[実際の使用例\]\(screen.png\)

> Tip:  最後のグループを除き、`//\END` は省略できます。次の `//\HEADER:` を記述すると、新しいグループに切り替わります。最後のグループには `//\END` を記述してください。
> Tip:　You can omit `//\END` between groups. Writing another `//\HEADER:` starts a new group. The final group must be closed with `//\END.`

## Requirements/要件🔧

動作確認済みの言語

The following languages have been tested:

- c++
- c#
- javascript


## Release Notes/リリースノート📋


### 1.0.0

初回リリース

Initial release
